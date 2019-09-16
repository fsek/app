var loginScreen = app.loginScreen.create({
  el: '.login-screen',
  on: {
    opened: function () {
      // Fix statusbar and close splash
      document.addEventListener('deviceready', function() {
        navigator.splashscreen.hide();
        StatusBar.backgroundColorByHexString(loginBarColor);
        //StatusBar.overlaysWebView(true);
      }, false);
    },
    close: function () {
      StatusBar.overlaysWebView(false);
    }
  }
});

// Redirect from the login screen if the user has signed in before
$.auth.validateToken()
  .done(function() {
    // Fix statusbar and close splash
    document.addEventListener('deviceready', function() {
      navigator.splashscreen.hide();
      StatusBar.overlaysWebView(false);
    }, false);

    afterSignIn();
  })
  .fail(function() {
    loginScreen.open(false); // true if animation
  });

$$(document).on('page:init', '.page[data-name="login"]', function () {
  $('.login-btn').on('click', function () {
    var abort = false;

    // Adds preloader after 1 s of loading
    var preloadTimeout = setTimeout(function() {
      app.dialog.preloader('Mutar spindelmännen med godis...');
    }, 1000);

    // Aborts the preloader and request after 20s
    var abortTimeout = setTimeout(function() {
      clearTimeout(preloadTimeout);
      app.dialog.close();
      $('#login-form input[name="password"]').val('');
      abort = true;
      app.dialog.alert('Begäran tog för lång tid. Kontrollera din internetanslutning (eduroam räknas inte) :\'(', 'Inloggningen misslyckades');
    }, 20000);

    /*
     * Get the input data and send a sign in request. If successful we initialize stuff in afterSignIn()
     * otherwise we alert error messages and clear pw field. We also clear the preloader timeouts.
     */
    var loginFormData = app.form.convertToData('#login-form');
    $.auth.emailSignIn(loginFormData)
      .done(function() {
        if (!abort) {
          afterSignIn();
          clearTimeout(preloadTimeout);
          clearTimeout(abortTimeout);
          app.dialog.close();
        }
      })
      .fail(function(resp) {
        if (!abort) {
          app.dialog.close(); // Close the preloader
          if (typeof resp.data.errors === 'undefined') { // Is undefined if we don't get a response from the server
            app.dialog.alert('Oväntat fel uppstod. Kontrollera din internetanslutning :(', 'Inloggningen misslyckades');
          } else {
            app.dialog.alert('Ogiltig E-post eller lösenord', 'Inloggningen misslyckades');
          }

          $('#login-form input[name="password"]').val('');
          clearTimeout(preloadTimeout);
          clearTimeout(abortTimeout);
        }
      });
  });

  // Fade parts of the UI when the keyboard is displayed on android
  if (app.device.android) {
    var loginContainer = $('.login-container');
    loginContainer.on('focus', 'input', function(e) {
      $('.open-login-info').fadeOut();
      $('.login-footer').fadeOut();
    });

    loginContainer.on('blur', 'input', function(e) {
      // Don't blur if we switched to another input field
      if (e.relatedTarget) return;

      setTimeout(function() {
        $('.open-login-info').fadeIn();
        $('.login-footer').fadeIn();
      }, 250);
    });
  }

  $('.login-logo').on('touchstart', function(e) {
    const logo = $(this);
    if (!logo.hasClass('login-logo-spin')) {
      logo.addClass('login-logo-spin');
      setTimeout(function() {
        logo.removeClass('login-logo-spin');
      }, 1500);
    }
  });
});

function afterSignIn() {
  // Fix statusbar
  StatusBar.backgroundColorByHexString(mainBarColor);

  loginScreen.close();

  //Checks if user has accepted the latest terms and prompts them if they have not
  checkTermsVersion();

  // Show home tab with news (needs to be done if an user logs out)
  app.tab.show('#view-home');

  // Init all the different tab's functions
  pushAfterLogin();
  initNotificationBadge();
  loadHome();
  setGroupNotification();

  // if ($$('#groups-list ul').is(':empty')) getGroups();

  if ($('#calendar').is(':empty')) initCalendar($('.page.calendar-page'));

  if ($('#notification-list ul').is(':empty')) getNotifications(false);
}
