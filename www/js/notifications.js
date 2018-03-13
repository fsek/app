var nextPage = 1;
var loadingNotifications = false;
var infNotificationScroll = true;

function getNotifications(refresh) {
  $.getJSON(API + '/notifications')
    .then(function(resp) {
      $$('#notification-list ul').html('');

      appendNotifications(resp.notifications);
      updateNotificationBadge(resp.meta.unread);
      nextPage = resp.meta.next_page;

      if(refresh) app.pullToRefreshDone();
      if(!infNotificationScroll) attachInfNotificationScroll();

      // Fill the screen if more notifications exist
      if($$(window).height() >= $$('#notification-list').height()) moreNotifications();
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
      if($$(window).height() >= $$(document).height()) moreNotifications();
    });
}

function appendNotifications(notifications) {
  var notificationList = $$('#notification-list ul');
  if (notifications.length !== 0) {
    for(notification of notifications) {
      templateHTML = app.templates.notificationTemplate({notification: notification, hasNotifications: true});
      notificationList.append(templateHTML);
    }
  }else if($('.no-notifications').length === 0){
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
      alert("Failed to mark notification as read.");
    }
  });
}

function attachInfNotificationScroll() {
  app.attachInfiniteScroll($$('#tab4 .infinite-scroll'));
  $$('#tab4 .page-content').append(infScrollPreloader);
  infNotificationScroll = true;
}

function detachInfNotificationScroll() {
  infNotificationScroll = false;
  app.detachInfiniteScroll($$('#tab4 .infinite-scroll'));
  $$('#tab4 .infinite-scroll-preloader').remove();
}

function moreNotifications() {
  if (nextPage == null && infNotificationScroll) {
    detachInfNotificationScroll();
  } else if (!loadingNotifications) {
    getMoreNotifications();
  }
}

$$('#tab4').on('show', function() {
  // Get notifications if we haven't done so already
  if($$('#notification-list ul').is(':empty'))
    getNotifications(false);
});

$$('#tab4 .pull-to-refresh-content').on('ptr:refresh', function() {
  getNotifications(true);
});

$$('#tab4 .infinite-scroll').on('infinite', function() {
  moreNotifications();
});

$$('#notification-list').on('click', 'li', function() {
  if ($$(this).hasClass('unseen')) {
    lookNotification($$(this).attr('id'));
    $$(this).removeClass('unseen');
  }
  // Redirect to event/notifyable here
});

//DELETE THIS IN WITH V2
myApp.onPageInit('tab4', function(page){
  if($$('#notification-list ul').is(':empty')) {
    getNotifications(false);
  }
});
