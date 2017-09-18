// Redirect from the login screen if the user has signed in before
$.auth.validateToken()
  .done(function() {
    afterSignIn();
  })
  .fail(function() {
    myApp.showTab('#login');
  });

myApp.onPageInit('login', function(page){
  // Activate the login button if we have text in the input field, otherwise disable it
  $('.login-content input').on('input', function(e){
    var email = $('input[name="login-email"]').val();
    var password = $('input[name="login-password"]').val();
    var loginBtn = $('.login-btn');

    if(email != '' && password != ''){
      if(loginBtn.hasClass('disabled')){
        loginBtn.removeClass('disabled');
      }
    }else{
      if(!loginBtn.hasClass('disabled')){
        loginBtn.addClass('disabled');
      }
    }
  });

  // Send an sign in request to the API when the login button is clicked.
  // We also display error messages on fail and add preloaders after 1 s of loading
  $('.login-btn').on('click', function () {
    var email = $('input[name="login-email"]').val();
    var password = $('input[name="login-password"]').val();
    var abort = false;

    var preloadTimeout = setTimeout(function(){
      myApp.showPreloader('Mutar spindelmännen...');
    }, 1000);

    // Aborts the preloader and request after 20s 
    var abortTimeout = setTimeout(function(){
      clearTimeout(preloadTimeout);
      myApp.hidePreloader();
      abort = true;
      myApp.alert("Begäran tog för lång tid. Kontrollera din internetanslutning (eduroam räknas inte) :'(", "Inloggningen misslyckades")
    }, 20000);

    $.auth.emailSignIn({
      email: email,
      password: password
    })
    .done(function() {
      if(!abort){
        afterSignIn();
        clearTimeout(preloadTimeout);
        clearTimeout(abortTimeout);
        myApp.hidePreloader();
      }
    })
    .fail(function(resp) {
      if(!abort){
        if(typeof resp.data.errors == 'undefined'){ // Is undefined if we don't get a response from the server
          myApp.alert("Oväntat fel uppstod. Kontrollera din internetanslutning :(", "Inloggningen misslyckades");
        }else{
          $('input[name="login-password"]').val('');
          $('.login-btn').addClass('disabled');
          myApp.alert("Ogiltig E-post eller lösenord", "Inloggningen misslyckades");
        }
        clearTimeout(preloadTimeout);
        clearTimeout(abortTimeout);
        myApp.hidePreloader();
      }
    });
  });

  // Fade parts of the UI when the keyboard is displayed on android
  if (myApp.device.android) {
    var loginContainer = $('.login-container');
    loginContainer.on('focus', 'input', function(e) {
      $('.open-login-info').fadeOut();
      $('.login-footer').fadeOut();
    });

    loginContainer.on('blur', 'input', function(e) {
      // Don't blur if we switched to another input field
      if(e.relatedTarget) return;

      setTimeout(function() {
        $('.open-login-info').fadeIn();
        $('.login-footer').fadeIn();
      }, 250);
    });
  }

  $('.login-logo').on('touchstart touchend', function(e) {
      $(this).toggleClass('login-logo-spin');
  });
}).trigger();

$$('#login').on('tab:show', function(){
  $('.tabbar').hide();

   // Fix statusbar and close splash
  document.addEventListener('deviceready', function() {
    navigator.splashscreen.hide();
    StatusBar.backgroundColorByHexString(loginBarColor);
    StatusBar.overlaysWebView(false);
  }, false);
});

function afterSignIn() {
  // Fix statusbar and close splash
  document.addEventListener('deviceready', function() {
    navigator.splashscreen.hide();
    StatusBar.overlaysWebView(false);
    StatusBar.backgroundColorByHexString(mainBarColor);
  }, false);

  // Close login screen
  myApp.showTab('#tab1');
  $('.tabbar').show();

  // Clear for next login
  $('input[name="login-email"]').val('');
  $('input[name="login-password"]').val('');

  pushAfterLogin();
  initNotificationBadge();
  loadHome();
  getGroups();
}
