var nextPage = 1;
var loadingNotifications = false;
var infNotificationScroll = true;

// Init notifications if not already inited
$$(document).on('page:init', '.page[data-name="notifications"]', function (e) {
  // If signed in and notification container is empty
  if (!jQuery.isEmptyObject($.auth.user) && $('#notification-list ul').is(':empty')) {
    getNotifications(false);
  }
});

$$('#noti-btn').on('click', function() {
  $$('.page-content').scrollTop(0, 0);
});

$$('#view-notifications .ptr-content').on('ptr:refresh', function() {
  getNotifications(true);
});

$$('#view-notifications .infinite-scroll-content').on('infinite', function() {
  moreNotifications();
});

$$('#notification-list').on('click', 'li', function() {
  if ($$(this).hasClass('unseen')) {
    lookNotification($$(this).attr('data-id'));
    $$(this).removeClass('unseen');
  }
  // Redirect to event/notifyable here
});

function getNotifications(refresh) {
  $.getJSON(API + '/notifications')
    .then(function(resp) {
      $$('#notification-list ul').html('');

      appendNotifications(resp.notifications);
      updateNotificationBadge(resp.meta.unread);
      nextPage = resp.meta.next_page;

      if (refresh) app.ptr.done($$('#view-notifications .ptr-content'));
      if (!infNotificationScroll) attachInfNotificationScroll();

      // Fill the screen if more notifications exist
      if ($$(window).height() >= $$('#notification-list').height()) moreNotifications();
    });
}

function getMoreNotifications() {
  loadingNotifications = true;
  $.getJSON(API + '/notifications', {page: nextPage})
    .then(function(resp) {
      appendNotifications(resp.notifications);
      updateNotificationBadge(resp.meta.unread);
      nextPage = resp.meta.next_page;
      loadingNotifications = false;

      // Fill the screen if more notifications exist
      if ($$(window).height() >= $$(document).height()) moreNotifications();
    });
}

function appendNotifications(notifications) {
  var notificationList = $$('#notification-list ul');
  if (notifications.length !== 0) {
    for (notification of notifications) {
      notification.created_at = new Date(notification.created_at);
      notification.created_at = notification.created_at.yyyymmdd() + ' ' + notification.created_at.hhmm();
      templateHTML = app.templates.notificationTemplate({notification: notification,
        hasNotifications: true});
      notificationList.append(templateHTML);
    }
  } else if ($('.no-notifications').length === 0) {
    templateHTML = app.templates.notificationTemplate({hasNotifications: false});
    $('#notification-list').after(templateHTML);
  }
}

function initNotificationBadge() {
  if ($.auth.user.notifications_count > 0) {
    $$('#notification-badge').show();
    $$('#notification-badge').html($.auth.user.notifications_count);
  } else {
    $$('#notification-badge').hide();
  }
}

function updateNotificationBadge(count) {
  if (count > 0) {
    $$('#notification-badge').html(count);
    $$('#notification-badge').show();
  } else {
    $$('#notification-badge').hide();
  }
}

function lookNotification(id) {
  $.ajax({
    url: API + '/notifications/'+ id + '/look',
    type: 'PATCH',
    success: function(resp) {
      updateNotificationBadge(resp.unread);
    },
    error: function(resp) {
      alert('Failed to mark notification as read.');
    }
  });
}

function attachInfNotificationScroll() {
  app.attachInfiniteScroll($$('#view-notifications .infinite-scroll-content'));
  $$('#view-notifications .page-content').append(infScrollPreloader);
  infNotificationScroll = true;
}

function destroyInfNotificationScroll() {
  infNotificationScroll = false;
  app.infiniteScroll.destroy($$('#view-notifications .infinite-scroll-content'));
  $$('#view-notifications .infinite-scroll-preloader').remove();
}

function moreNotifications() {
  if (nextPage == null && infNotificationScroll) {
    destroyInfNotificationScroll();
  } else if (!loadingNotifications) {
    getMoreNotifications();
  }
}
