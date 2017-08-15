var group_app = null;
var group_paused = false;
var F7msg = null;

myApp.onPageInit('messages', function (page) {
  var head = $(page.container); // We need jQuery on this page
  initMessages(head, page.query);
});

function initMessages(head, query) {
  var messages = head.find('#group-messages');
  var userId = $.auth.user.id;
  var groupId = query.groupId;

  var page = 2;
  var totalPages = 37;
  var loadingMessages = false;

  // Set group name
  head.find('#group-name').html(query.groupName);

  // Initialize Framework7 mesages
  F7msg = myApp.messages(messages, {
    autoLayout: true,
    scrollMessages: true,
    messageTemplate: $$('#messageTemplate').html()
  });

  // Initialize Framework7 message bar
  var msgBar = myApp.messagebar('.messagebar', {
    maxHeight: 75
  });

  // Infinite scroll
  var infiniteScroll = head.find('.infinite-scroll');

  var detachInftScroll = function() {
    myApp.detachInfiniteScroll(infiniteScroll);
    infiniteScroll.find('.infinite-scroll-preloader').remove();
  };

  // Functions for batch loading of messages
  var batchPrepare = function(msgs) {
    var lastDay = null;

    for (message of msgs) {
      // Sender or receiver? Framework7 defaults to sender
      if(message.user_id != userId) message.type = 'received';

      // Add headers for new dates
      if(lastDay != message.day) {
        message.dayHeader = message.day;
        lastDay = message.day;
      }
    }
    return msgs;
  };

  var batchAddMessages = function(msgs) {
    // Expects msgs to be in the wrong order, latest first.
    if(msgs.length < 1) return;

    // Remove top day header if the last message in msgs was sent the same day
    var first = messages.find('.messages-date:first');
    if(msgs[0].day == first.html()) first.remove();

    // Add day headers and set sender/receiver tag. Then add to window
    msgs = batchPrepare(msgs.reverse());
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
      .then(function(resp) {
        F7msg.clean();
        batchAddMessages(resp.messages);
        totalPages = resp.meta.total_pages;

        // Fill the screen if more messages exist
        if($$(window).height() >= messages.height()) moreMessages();
      });
  }

  loadMessages();

  // Functions for single messages
  var receivedMessage = function(message) {
    var lastDay = messages.find('.messages-date:last').html();
    if(message.day != lastDay) message.dayHeader = message.day;
    if(message.user_id != userId) message.type = 'received';

    F7msg.addMessage(message);
  };

  var removeMessage = function(messageId) {
    messages.find('[id="' + messageId + '"]').remove();
  };

  var updateMessage = function(message) {
    var msg = messages.find('[id="' + message.id + '"]');
    if(!msg.length) return;

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
    group_id: groupId },
  { connected: function() {},
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

  window.addEventListener('native.keyboardshow', function(e) {
    F7msg.scrollMessages(350);
  });

  // Send message on enter
  msgBar.textarea.on('keypress', function(e) {
    if(e.which === 13) {
      group_app.sendMessage(msgBar.value());
      msgBar.value('');
      e.preventDefault();
      return false;
    }
 });

  // Show popup editor for sent messages
  var popupEditor = function(messageId) {
    $$.get('message_editor.html', function(data) {
      var popup = $(myApp.popup(data, true));
      var editor = popup.find('#message-editor');

      // Get unformatted message content
      $.ajax({
        url: API + '/messages/'+ messageId + '/edit',
        success: function(resp) {
          editor.val(resp.content);
        },
        error: function(resp) {
          alert("Could not get message data.");
          myApp.closeModal(popup);
        }
      });

      // Send updated message to action cable
      popup.on('click', '#message-edit-submit', function() {
        var content = editor.val();
        group_app.updateMessage(messageId, content);

        myApp.closeModal(popup);
      });
    });
  };

  // Show action menu on long tap (sent messages only)
  messages.on('taphold', '.message', function() {
    if($$(this).hasClass('message-received')) return;

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

    myApp.actions($$(this), buttons);
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
    if(group_app && group_paused) {
      group_paused = false;
      loadMessages();
      cable.subscriptions.add(group_app);
    }
  };

  // Disconnect action cable if the app is paused. Reconnect when it's opened again.
  document.addEventListener('pause', pauseGroup, false);
  document.addEventListener('resume', resumeGroup, false);

  var groupBack = myApp.onPageBack('messages', function (page) {
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

