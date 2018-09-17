var groupApp = null;
var groupPaused = false;
var F7msg = null;

$$(document).on('page:init', '.page[data-name="messages"]', function(e) {
  app.toolbar.hide('.toolbar');
  const head = $(e.target);

  initMessages(head, e.detail.route.params);
});

$$('#msg-btn').on('click', function() {
  $$('.page-content').scrollTop(0, 0);
});

function initMessages(head, query) {
  const messages = head.find('#group-messages');
  const userId = $.auth.user.id;
  const groupId = query.groupId;

  let page = 2;
  let totalPages = 37;
  let loadingMessages = false;

  // Initialize Framework7 mesages
  F7msg = app.messages.create({
    el: '.messages',
    firstMessageRule: function(message, previousMessage) {
      if (message.isTitle) return false;

      if (message.type === 'received') {
        if (
          !previousMessage ||
          previousMessage.type !== message.type ||
          previousMessage.name !== message.name
        ) {
          return true;
        }
      }
      return false;
    },
    lastMessageRule: function(message, previousMessage, nextMessage) {
      if (message.isTitle) return false;

      if (message.type === 'received') {
        if (
          !nextMessage ||
          nextMessage.type !== message.type ||
          nextMessage.name !== message.name
        ) {
          return true;
        }
      }
      return false;
    },
    tailMessageRule: function(message, previousMessage, nextMessage) {
      if (message.isTitle) return false;

      if (
        !nextMessage ||
        nextMessage.type !== message.type ||
        nextMessage.name !== message.name
      ) {
        return true;
      }
      return false;
    },
    customClassMessageRule: function(message) {
      if (message.isTitle) return false;

      if (message.by_admin) {
        return 'message-admin';
      }
      return false;
    }
  });

  // Set group name
  $('#messages-group-name').html(query.groupName);
  app.navbar.size($('#view-nollning .navbar'));
  
  let msgBar;
  // Check if group type is 'info', then we don't want to display messagebar
  if (query.groupType !== 'info') {
    // Initialize Framework7 message bar
    msgBar = app.messagebar.create({
      el: '.messagebar',
      maxHeight: 75
    });

    // Handle the "send" button. Don't close the keyboard on press
    const messageBtn = head.find('#messageBtn');
    nonFocusingButton(messageBtn, function() {
      groupApp.sendMessage(msgBar.getValue());
      msgBar.clear();
    });
  } else {
    msgBar = $('.messagebar');
    msgBar.addClass('disabled');
    msgBar.find('textarea')[0].placeholder = 'Chatten är skrivskyddad';
  }

  // Infinite scroll
  const infiniteScroll = head.find('.infinite-scroll-content');

  function detachInftScroll() {
    app.infiniteScroll.destroy('.infinite-scroll-content');
    infiniteScroll.find('.infinite-scroll-preloader').remove();
  }

  function showImage(message) {
    const maxWidth = 0.8 * window.innerWidth;
    const maxHeight = 0.7 * window.innerHeight;
    let width = message.image_details.thumb[0];
    let height = message.image_details.thumb[1];

    if (height > maxHeight) {
      width = width * maxHeight / height;
      height = maxHeight;
    }

    if (width > maxWidth) {
      height = height * maxWidth / width;
      width = maxWidth;
    }

    message.image = `<img data-src="${
      message.image_url
    }" class="lazy lazy-fade-in" style="width: ${width}px; height: ${height}px";/>`;
  }

  // Functions for batch loading of messages
  function batchPrepare(msgs) {
    let lastDay = null;
    let preparedMsgs = [];
    msgs.reverse();

    for (const message of msgs) {
      // Sender or receiver? Framework7 defaults to sender
      if (message.user_id !== userId) {
        message.type = 'received';
      } else {
        // We don't want to display the user's own avatar
        message.avatar = null;
      }

      if (message.image_url) {
        showImage(message);
      }

      // Add headers for new dates
      if (lastDay !== message.day) {
        lastDay = message.day;

        const messageTitle = {};
        messageTitle.text = message.day;
        messageTitle.isTitle = true;
        preparedMsgs.push(messageTitle);
      }

      message.text = message.text || '';
      message.text += `<div class="message-id hidden" data-message-id="${
        message.id
      }"></div>`;

      preparedMsgs.push(message);
    }
    return preparedMsgs.reverse();
  }

  function batchAddMessages(msgs) {
    // Expects msgs to be in the wrong order, latest first.
    if (msgs.length < 1) return;

    // Remove top day header if the last message in msgs was sent the same day
    const first = messages.find('.messages-date:first');
    if (msgs[0].day === first.html()) first.remove();

    // Add day headers and set sender/receiver tag. Then add to window
    const preparedMessages = batchPrepare(msgs);
    F7msg.addMessages(preparedMessages, 'prepend', false);
  }

  function loadMoreMessages() {
    $.getJSON(API + '/groups/' + groupId + '/messages?page=' + page).then(
      function(resp) {
        batchAddMessages(resp.messages);
        page++;
        loadingMessages = false;

        // Detach the infinite scroll preloader if this is the last page
        if (page > totalPages) detachInftScroll();
      }
    );
  }

  function moreMessages() {
    if (!loadingMessages) {
      if (page <= totalPages) {
        loadingMessages = true;
        loadMoreMessages();
      } else {
        detachInftScroll();
      }
    }
  }

  function loadMessages() {
    $.getJSON(API + '/groups/' + groupId + '/messages/').done(function(resp) {
      F7msg.clear();
      batchAddMessages(resp.messages);
      totalPages = resp.meta.total_pages;

      // Fill the screen if more messages exist
      if ($$(window).height() >= messages.height()) moreMessages();

      // Detach the infinite scroll preloader if there only is one page
      if (totalPages === 1) detachInftScroll();
    });
  }

  loadMessages();

  // Functions for single messages
  function receivedMessage(message) {
    const lastDay = messages.find('.messages-date:last').html();
    if (message.day !== lastDay) message.dayHeader = message.day;
    if (message.user_id !== userId) message.type = 'received';

    if (message.image_url) {
      showImage(message);
    }

    F7msg.addMessage(message);
  }

  function removeMessage(messageId) {
    messages
      .find(`[data-message-id="${messageId}"]`)
      .closest('.message')
      .remove();
  }

  function updateMessage(message) {
    const msg = messages
      .find(`[data-message-id="${message.id}"]`)
      .closest('.message');

    if (!msg.length) return;

    // FIXA SÅ ATT MESSAGE-ID inte försvinner vid update

    msg.find('.message-text').html(message.text);
    const msgUpdated = msg.find('.message-updated');

    if (msgUpdated.length) {
      msgUpdated.html(message.updated_at);
    } else {
      msg.append(
        '<div class="message-label message-updated">' +
          message.updated_at +
          '</div>'
      );
    }
  }

  // Initialize action cable
  groupApp = cable.subscriptions.create(
    {
      channel: 'GroupsChannel',
      group_id: groupId
    },
    {
      connected: null,
      disconnected: null,
      received: function(data) {
        if (data.action === 'create') {
          receivedMessage(data.message.message);
        } else if (data.action === 'destroy') {
          removeMessage(data.message_id);
        } else if (data.action === 'update') {
          updateMessage(data.message.message);
        }
      },

      /*
       * Sends a text-only message through the open
       * websocket using Action Cable. This is faster
       * than the API function `sendWithImage` below!
       */
      sendMessage: function(content) {
        return this.perform('send_message', {
          content: content,
          group_id: groupId
        });
      },
      destroyMessage: function(messageId) {
        return this.perform('destroy_message', {
          message_id: messageId
        });
      },
      updateMessage: function(messageId, content) {
        return this.perform('update_message', {
          message_id: messageId,
          content: content
        });
      }
    }
  );

  /*
   * Sends a message with an image through the regular API
   * NOTE: Using an AJAX POST is a little bit slower than
   * Action Cable, so don't use it for regular messages!
   */
  function sendWithImage(content) {
    const imageUrl = msgBar.attachments[0];
    msgBar.attachmentsHide();
    msgBar.attachments = [];

    window.resolveLocalFileSystemURL(imageUrl, function(fileEntry) {
      fileEntry.file(
        function(file) {
          console.log('waiting for file');
          let reader = new FileReader();
          reader.onloadend = function() {
            console.log('loaded');
            const blob = new Blob([this.result], {type: 'image/jpeg'});

            const data = new FormData();
            data.append('message[content]', content);

            // The server expects a *.jpg filename
            data.append('message[image]', blob, 'image.jpg');

            $.ajax({
              url: API + '/groups/' + groupId + '/messages',
              data: data,
              contentType: false,
              processData: false,
              method: 'POST'
            });

            // TODO: Handle any errors
          };
          reader.readAsArrayBuffer(file);
        },
        function(e) {

          /* TODO: Handle any errors*/
        }
      );
    });
  }

  window.addEventListener('native.keyboardshow', function() {
    if (F7msg) {
      F7msg.scroll(350);

      if (app.device.android) {
        infiniteScroll.find('.infinite-scroll-preloader').hide();
      }
    }
  });

  if (app.device.android) {
    window.addEventListener('native.keyboardhide', function() {
      if (F7msg) {
        infiniteScroll.find('.infinite-scroll-preloader').show();
        F7msg.scroll(0);
      }
    });
  }

  // Show popup editor for sent messages
  function popupEditor(messageId) {
    $$.get('message_editor.html', function(data) {
      var popup = $(app.popup(data, true));
      var editor = popup.find('#message-editor');

      // Get unformatted message content
      $.ajax({
        url: API + '/messages/' + messageId + '/edit',
        success: function(resp) {
          editor.val(resp.content);
        },
        error: function() {
          alert('Could not get message data.');
          app.closeModal(popup);
        }
      });

      // Send updated message to action cable
      popup.on('click', '#message-edit-submit', function() {
        var content = editor.val();
        groupApp.updateMessage(messageId, content);

        app.closeModal(popup);
      });
    });
  }

  // Handle the camera button
  const cameraBtn = head.find('#messageCameraBtn');
  cameraBtn.on('click', function() {
    const options = {
      quality: 100,
      correctOrientation: true
    };

    navigator.camera.getPicture(
      function(imageUrl) {
        msgBar.attachments = [];
        msgBar.attachments.push(imageUrl);
        msgBar.renderAttachments();
        msgBar.attachmentsShow();
      },
      null,
      options
    );
  });

  // Handle the gallery/image select button
  const galleryBtn = head.find('#messageGalleryBtn');
  galleryBtn.on('click', function() {
    const options = {
      sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
      quality: 100,
      correctOrientation: true
    };

    navigator.camera.getPicture(
      function(imageUrl) {
        msgBar.attachments = [];
        msgBar.attachments.push(imageUrl);
        msgBar.renderAttachments();
        msgBar.attachmentsShow();
      },
      null,
      options
    );
  });

  // Delete image attachments on delete button press
  msgBar.on('attachmentDelete', function() {
    msgBar.attachmentsHide();
    msgBar.attachments = [];
  });

  // Show action menu on long tap (sent messages only)
  messages.on('taphold', '.message', function() {
    if ($$(this).hasClass('message-received')) return;

    const messageId = $$(this)
      .find('.message-id')
      .data('message-id');
    const buttons = [
      {
        text: 'Redigera',
        onClick: function() {
          popupEditor(messageId);
        }
      },
      {
        text: 'Ta bort',
        color: 'red',
        onClick: function() {
          alert('hej' + messageId);
          groupApp.destroyMessage(messageId);
        }
      }
    ];

    const actions = app.actions.create({buttons});
    actions.open();
  });

  // Enable infinite scroll
  infiniteScroll.on('infinite', function() {
    moreMessages();
  });

  function pauseGroup() {
    if (groupApp) {
      groupPaused = true;
      groupApp.unsubscribe();
    }
  }

  function resumeGroup() {
    if (groupApp && groupPaused) {
      groupPaused = false;
      loadMessages();
      cable.subscriptions.add(groupApp);
    }
  }

  // Disconnect action cable if the app is paused. Reconnect when it's opened again.
  document.addEventListener('pause', pauseGroup, false);
  document.addEventListener('resume', resumeGroup, false);

  const groupBack = $$(document).on(
    'page:beforeremove',
    '.page[data-name="messages"]',
    function() {
      groupBack.remove();

      $('.tabbar').show();
      getGroups();

      document.removeEventListener('pause', pauseGroup, false);
      document.removeEventListener('resume', resumeGroup, false);

      groupApp.unsubscribe();
      cable.disconnect();
      groupPaused = false;
      groupApp = null;
      F7msg = null;
    }
  );
}
