function setupPush() {
  pushService = PushNotification.init({
    "android": {
      "senderID": "509736475453",
      "icon": "f",
      "iconColor": "#EB7125"
    },
    "ios": {
      "senderID": "509736475453",
      "gcmSandbox": true, // True for development
      "sound": true,
      "alert": true,
      "badge": true
    }
  });

  // Get/update the registration id
  pushService.on('registration', function(data) {
    var oldId = localStorage.getItem('registrationId');

    if (oldId !== data.registrationId) {
      localStorage.setItem('registrationId', data.registrationId);

      // Create or update the registration id on the server if the user is signed in
      if($.auth.user.signedIn) updatePushDevice(oldId, data.registrationId);
    }
  });

  pushService.on('error', function(e) {
    alert("push error = " + e.message);
  });

  pushService.on('notification', function(data) {
    /*navigator.notification.alert(
      data.message,         // message
      null,                 // callback
      data.title,           // title
      'OK'                  // buttonName
    );*/
    getNotifications(false);
  });
}

function updatePushDevice(oldId, newId) {
  createPushDevice(newId);

  if(oldId !== null) deletePushDevice(oldId, null);
}

// Create a new push device for this user
function createPushDevice(registrationId) {
  $.ajax({
    url: API + '/push_devices',
    type: 'POST',
    dataType: 'json',
    data: {push_device: {token: registrationId, system: cordova.platformId}}
  })
  .fail(function(resp) {
    alert("Failed to create push device id!");
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
  .fail(function(resp) {
    alert("Failed to delete push device id!");
  })
  .always(function(resp) {
    if(signOut) $.auth.signOut();
  });
}

// Send push device to server after sign in
function pushAfterLogin() {
  var registrationId = localStorage.getItem('registrationId');
  if(registrationId !== null) updatePushDevice(null, registrationId);
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
      alert('Failed to unregisted from push service!');
    });
  } else {
    $.auth.signOut();
  }
}

// Always init Phonegap Push on startup
document.addEventListener("deviceready", setupPush, false);
