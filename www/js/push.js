function setupPush() {
  pushService = PushNotification.init({
    'android': {
      'senderID': '509736475453',
      'icon': 'f',
      'iconColor': '#EB7125'
    },
    'ios': {
      'senderID': '509736475453',
      'gcmSandbox': true, // True for development
      'sound': true,
      'alert': true,
      'badge': true
    }
  });
      
  // Get/update the registration id
  pushService.on('registration', function(data) {
    var oldId = localStorage.getItem('registrationId');

    if (oldId !== data.registrationId) {
      localStorage.setItem('registrationId', data.registrationId);

      // Create or update the registration id on the server if the user is signed in
      if ($.auth.user.signedIn) updatePushDevice(oldId, data.registrationId);
    }
  });

  pushService.on('notification', function(data) {
    if ('group_id' in data.additionalData) {
      groupPush(data);
    } else {
      getNotifications(false);
    }
  });

  function groupPush(data) {
    if (data.additionalData.foreground) {
      getGroups();
    } else if ($.auth.user.signedIn) {
      openGroup(data);
    } else {
      // App is closed, wait for validation
      var authEvent = PubSub.subscribe('auth.validation.success', function() {
        PubSub.unsubscribe(authEvent);
        openGroup(data);
      });
    }
  }

  function openGroup(data) {
    app.showTab('#tab3');

    var groupId = data.additionalData.group_id;
    var page = tabView3.activePage;

    if (page.name == 'messages' && page.query.groupId != groupId) {
      tabView4.router.back({animatePages: false});
    }

    tabView3.router.load({
      url: 'messages.html',
      query: {groupId: data.additionalData.group_id,
        groupName: data.title}
    });
  }
}

function updatePushDevice(oldId, newId) {
  createPushDevice(newId);

  if (oldId !== null) deletePushDevice(oldId, null);
}

// Create a new push device for this user
function createPushDevice(registrationId) {
  $.ajax({
    url: API + '/push_devices',
    type: 'POST',
    dataType: 'json',
    data: {push_device: {token: registrationId,
      system: cordova.platformId}}
  });
}

// Delete a push device belonging to this user
function deletePushDevice(registrationId, signOut) {
  $.ajax({
    url: API + '/push_devices',
    type: 'DELETE',
    dataType: 'json',
    data: {token: registrationId}
  })
    .always(function(resp) {
      if (signOut) $.auth.signOut();
    });
}

// Send push device to server after sign in
function pushAfterLogin() {
  var registrationId = localStorage.getItem('registrationId');
  if (registrationId !== null) updatePushDevice(null, registrationId);
}

function deletePushAndSignOut() {
  var registrationId = localStorage.getItem('registrationId');
  if (registrationId !== null) {
    // Remove push device from the server
    deletePushDevice(registrationId, true);

    // Unregister from firebase
    pushService.unregister(function() {
      // Success, all event listeners removed. Init the push service again
      setupPush();
    }, function() {
      // Error
    });
  } else {
    $.auth.signOut();
  }
}

// Always init Phonegap Push on startup
document.addEventListener('deviceready', setupPush, false);
