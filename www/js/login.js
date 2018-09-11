var loginScreen = app.loginScreen.create({
  el: '.login-screen',
  on: {
    opened: function () {
      // Fix statusbar and close splash
      document.addEventListener('deviceready', function() {
        navigator.splashscreen.hide();
        StatusBar.backgroundColorByHexString(loginBarColor);
        StatusBar.overlaysWebView(false);
      }, false);
    }
  }
});

// Redirect from the login screen if the user has signed in before
$.auth.validateToken()
  .done(function() {
    afterSignIn();
  })
  .fail(function() {
    loginScreen.open(false); // true if animation
  });

$$(document).on('page:init', '.page[data-name="login"]', function () {
  // Activate the login button if we have text in the input field, otherwise disable it
  $('.login-screen-content input').on('input',function(e) {
    var loginFormData = app.form.convertToData('#login-form');
    var loginBtn = $('.login-btn');

    if (loginFormData.email != '' && loginFormData.password != '') {
      if (loginBtn.hasClass('disabled')) {
        loginBtn.removeClass('disabled');
      }
    } else if (!loginBtn.hasClass('disabled')) {
      loginBtn.addClass('disabled');
    }
  });

  $('.login-btn').on('click', function () {
    var abort = false;

    // Adds preloader after 1 s of loading
    var preloadTimeout = setTimeout(function() {
      app.dialog.preloader('Mutar spindelmännen...');
    }, 1000);

    // Aborts the preloader and request after 20s
    var abortTimeout = setTimeout(function() {
      clearTimeout(preloadTimeout);
      app.dialog.close();
      $('#login-form input[name="password"]').val('');
      $('.login-btn').addClass('disabled');
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

          $('.login-btn').addClass('disabled');
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
  // Fix statusbar and close splash
  document.addEventListener('deviceready', function() {
    navigator.splashscreen.hide();
    StatusBar.overlaysWebView(false);
    StatusBar.backgroundColorByHexString(mainBarColor);
  }, false);

  loginScreen.close();

  // Show home tab with news (needs to be done if an user logs out)
  app.tab.show('#view-home');

  // Init all the different tab's functions
  pushAfterLogin();
  initNotificationBadge();
  loadHome();
  getGroups();

  if ($('#calendar').is(':empty')) {
    initCalendar($('.page.calendar-page'));
  }
  if ($('#notification-list ul').is(':empty')) {
    getNotifications(false);
  }
}
