// Redirect from the login screen if the user has signed in before
$.auth.validateToken()
  .done(function() {
    afterSignIn();
  })
  .fail(function() {
    myApp.showTab('#login');
  });

myApp.onPageInit('login', function(){
  $('.login-content input').on('input',function(e){
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

  $('.login-btn').on('click', function () {
    var email = $('input[name="login-email"]').val();
    var password = $('input[name="login-password"]').val();

    $.auth.emailSignIn({
      email: email,
      password: password
    })
    .done(function() {
      afterSignIn();
    })
    .fail(function(resp) {
      $('input[name="login-password"]').val('');
      $('.login-btn').addClass('disabled');
      myApp.alert("Ogiltig E-post eller lösenord", "Inloggningen misslyckades");

    });
  });

  $('.open-login-info').on('click', function () {
    $('.login-info-container').animate({
      "height": "+=100%",
      "width": "+=100%"
    }, 250, function() {
      $('.login-info-content').removeClass('hidden');
    });
    
  });

  $('.close-login-info').on('click', function () {
    $('.login-info-content').addClass('hidden');
    $('.login-info-container').animate({
      "height": "-=100%",
      "width": "-=100%"
    }, 250);
  });

  if (myApp.device.android) {
    $(page.container).on('focus', 'input', function(e) {
      $('.open-login-info').fadeOut();
      $('.login-footer').fadeOut();
    });

    $(page.container).on('blur', 'input', function(e) {
      // Don't blur if we switched to another input field
      if(e.relatedTarget) return;

      setTimeout(function() {
        $('.open-login-info').fadeIn();
        $('.login-footer').fadeIn();
      }, 250);
    });
  }
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

  //close login screen
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
