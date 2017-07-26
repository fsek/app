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

      if(refresh) myApp.pullToRefreshDone();
      if(!infNotificationScroll) attachInfNotificationScroll();

      // Fill the screen if more notifications exist
      if($$(window).height() >= $$(document).height()) moreNotifications();
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
  for(notification of notifications) {
    templateHTML = myApp.templates.notificationTemplate(notification);
    $$('#notification-list ul').append(templateHTML);
  }
}

function initNotificationBadge() {
  if ($.auth.user.notifications_count > 0) {
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
  myApp.attachInfiniteScroll($$('#tab2 .infinite-scroll'));
  $$('#tab2 .page-content').append(infScrollPreloader);
  infNotificationScroll = true;
}

function detachInfNotificationScroll() {
  infNotificationScroll = false;
  myApp.detachInfiniteScroll($$('#tab2 .infinite-scroll'));
  $$('#tab2 .infinite-scroll-preloader').remove();
}

function moreNotifications() {
  if (nextPage == null && infNotificationScroll) {
    detachInfNotificationScroll();
  } else if (!loadingNotifications) {
    getMoreNotifications();
  }
}

$$('#tab2').on('show', function() {
  // Get notifications if we haven't done so already
  if($$('#notification-list ul').is(':empty'))
    getNotifications(false);
});

$$('#tab2 .pull-to-refresh-content').on('ptr:refresh', function() {
  getNotifications(true);
});

$$('#tab2 .infinite-scroll').on('infinite', function() {
  moreNotifications();
});

$$('#notification-list').on('click', 'li', function() {
  if ($$(this).hasClass('unseen')) {
    lookNotification($$(this).attr('id'));
    $$(this).removeClass('unseen');
  }
  // Redirect to event/notifyable here
});