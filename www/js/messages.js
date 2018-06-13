var group_app = null;
var group_paused = false;
var F7msg = null;

$$(document).on('page:init', '.page[data-name="messages"]', function (e) {
  app.toolbar.hide('.toolbar');
  var head = $(e.target);
  initMessages(head, e.detail.route.params);
});

function initMessages(head, query) {
  var messages = head.find('#group-messages');
  var userId = $.auth.user.id;
  var groupId = query.groupId;

  var page = 2;
  var totalPages = 37;
  var loadingMessages = false;


  // Initialize Framework7 mesages
  F7msg = app.messages.create({
    el: '.messages',
    firstMessageRule: function (message, previousMessage, nextMessage) {
      if (message.isTitle) return false;

      if (message.type === 'received') {
        if (!previousMessage || previousMessage.type !== message.type || previousMessage.name !== message.name) {
          return true;
        }
      }
      return false;
    },
    lastMessageRule: function (message, previousMessage, nextMessage) {
      if (message.isTitle) return false;

      if (message.type === 'received') {
        if (!nextMessage || nextMessage.type !== message.type || nextMessage.name !== message.name) {
          return true;
        }
      }
      return false;
    },
    tailMessageRule: function (message, previousMessage, nextMessage) {
      if (message.isTitle) return false;

      if (!nextMessage || nextMessage.type !== message.type || nextMessage.name !== message.name) {
        return true;
      }
      return false;
    },
    customClassMessageRule: function (message, previousMessage, nextMessage) {
      if (message.isTitle) return false;

      if (message.by_admin) {
        return 'message-admin';
      }
      return false;
    },
  });

  // Set group name
  $('#messages-group-name').html(query.groupName);
  app.navbar.size($('#view-groups .navbar'));

  // Initialize Framework7 message bar
  var msgBar = app.messagebar.create({
    el: '.messagebar',
    maxHeight: 75
  });
  
  // Infinite scroll
  var infiniteScroll = head.find('.infinite-scroll-content');

  var detachInftScroll = function() {
    app.infiniteScroll.destroy('.infinite-scroll-content');
    infiniteScroll.find('.infinite-scroll-preloader').remove();
  };
  
  // Functions for batch loading of messages
  var batchPrepare = function(msgs) {
    var lastDay = null;
    var preparedMsgs = [];
    msgs.reverse();

    for (message of msgs) {
      // Sender or receiver? Framework7 defaults to sender
      if (message.user_id !== userId) {
        message.type = 'received';
      } else {
        // We don't want to display the user's own avatar
        message.avatar = null;
      }

      // Add headers for new dates
      if (lastDay != message.day) {
        lastDay = message.day;

        var messageTitle = {};
        messageTitle.text = message.day;
        messageTitle.isTitle = true;
        preparedMsgs.push(messageTitle);
      }

      preparedMsgs.push(message);
    }
    return preparedMsgs.reverse();
  };

  var batchAddMessages = function(msgs) {
    // Expects msgs to be in the wrong order, latest first.
    if (msgs.length < 1) return;

    // Remove top day header if the last message in msgs was sent the same day
    var first = messages.find('.messages-date:first');
    if (msgs[0].day == first.html()) first.remove();

    // Add day headers and set sender/receiver tag. Then add to window
    msgs = batchPrepare(msgs);
    F7msg.addMessages(msgs, 'prepend', false);
  };

  var loadMoreMessages = function() {
    $.getJSON(API + '/groups/' + groupId + '/messages?page=' + page)
      .then(function(resp) {
        batchAddMessages(resp.messages);
        page++;
        loadingMessages = false;
      });
  };

  var moreMessages = function() {
    if (!loadingMessages) {
      if (page <= totalPages) {
        loadingMessages = true;
        loadMoreMessages();
      } else {
        detachInftScroll();
      }
    }
  };

  function loadMessages() {
    $.getJSON(API + '/groups/' + groupId + '/messages/')
      .done(function(resp) {
        F7msg.clear();
        batchAddMessages(resp.messages);
        totalPages = resp.meta.total_pages;

        // Fill the screen if more messages exist
        if ($$(window).height() >= messages.height()) moreMessages();
      });
  }

  loadMessages();

  // Functions for single messages
  var receivedMessage = function(message) {
    var lastDay = messages.find('.messages-date:last').html();
    if (message.day != lastDay) message.dayHeader = message.day;
    if (message.user_id != userId) message.type = 'received';

    F7msg.addMessage(message);
  };

  var removeMessage = function(messageId) {
    messages.find('[id="' + messageId + '"]').remove();
  };

  var updateMessage = function(message) {
    var msg = messages.find('[id="' + message.id + '"]');
    if (!msg.length) return;

    msg.find('.message-text').html(message.text);
    var msgUpdated = msg.find('.message-updated');

    if (msgUpdated.length) {
      msgUpdated.html(message.updated_at);
    } else {
      msg.append('<div class="message-label message-updated">' + message.updated_at + '</div>');
    }
  };

  // Initialize action cable
  group_app = cable.subscriptions.create({
    channel: 'GroupsChannel',
    group_id: groupId},
  {connected: function() {},
    disconnected: function() {},
    received: function(data) {
      if (data.action == 'create') {
        receivedMessage(data.message.message);
      } else if (data.action == 'destroy') {
        removeMessage(data.message_id);
      } else if (data.action == 'update') {
        updateMessage(data.message.message);
      }
    },
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
  });

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

  // Send message on enter
  $(msgBar.textareaEl).on('keypress', function(e) {
    if (e.which === 13) {
      group_app.sendMessage(msgBar.getValue());
      msgBar.clear();
      e.preventDefault();
      return false;
    }
  });

  // Show popup editor for sent messages
  var popupEditor = function(messageId) {
    $$.get('message_editor.html', function(data) {
      var popup = $(app.popup(data, true));
      var editor = popup.find('#message-editor');

      // Get unformatted message content
      $.ajax({
        url: API + '/messages/'+ messageId + '/edit',
        success: function(resp) {
          editor.val(resp.content);
        },
        error: function(resp) {
          alert('Could not get message data.');
          app.closeModal(popup);
        }
      });

      // Send updated message to action cable
      popup.on('click', '#message-edit-submit', function() {
        var content = editor.val();
        group_app.updateMessage(messageId, content);

        app.closeModal(popup);
      });
    });
  };

  // Show action menu on long tap (sent messages only)
  messages.on('taphold', '.message', function() {
    if ($$(this).hasClass('message-received')) return;

    var messageId = $$(this).attr('id');
    var buttons = [{
      text: 'Redigera',
      onClick: function() {
        popupEditor(messageId);
      }
    },
    {
      text: 'Ta bort',
      color: 'red',
      onClick: function() {
        group_app.destroyMessage(messageId);
      }
    }];

    app.actions($$(this), buttons);
  });

  // Enable infinite scroll
  infiniteScroll.on('infinite', function () {
    moreMessages();
  });

  var pauseGroup = function() {
    if (group_app) {
      group_paused = true;
      group_app.unsubscribe();
    }
  };

  var resumeGroup = function() {
    if (group_app && group_paused) {
      group_paused = false;
      loadMessages();
      cable.subscriptions.add(group_app);
    }
  };

  // Disconnect action cable if the app is paused. Reconnect when it's opened again.
  document.addEventListener('pause', pauseGroup, false);
  document.addEventListener('resume', resumeGroup, false);

  var groupBack = $$(document).on('page:beforeremove', '.page[data-name="messages"]', function (e) {
    groupBack.remove();

    $('.tabbar').show();
    getGroups();

    document.removeEventListener('pause', pauseGroup, false);
    document.removeEventListener('resume', resumeGroup, false);

    group_app.unsubscribe();
    cable.disconnect();
    group_paused = false;
    group_app = null;
    F7msg = null;
  });
}
