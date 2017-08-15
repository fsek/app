// Redirect from the login screen if the user has signed in before
$.auth.validateToken()
  .done(function() {
    afterSignIn();
  })
  .fail(function() {
    loadLoginPage(false);
  });

myApp.onPageInit('login', function (page) {
  $('.navbar').hide();

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
      myApp.alert("Ogiltig E-post eller lösenord", "Inloggningen misslyckades");

    });
  });

  $('.open-login-info').on('click', function () {
    $('.login-info-container').animate({
      "height": "+=100%",
      "width": "+=100%"
    }, 300);
  });

  $('.close-login-info').on('click', function () {
    $('.login-info-container').animate({
      "height": "-=100%",
      "width": "-=100%"
    }, 300);
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

  // Fix statusbar and close splash
  document.addEventListener('deviceready', function() {
    navigator.splashscreen.hide();
    StatusBar.overlaysWebView(false);
    StatusBar.styleLightContent();
    StatusBar.backgroundColorByHexString("#7999d2");
  }, false);
});

function loadLoginPage(animate){
  mainView.router.load({
    url: 'login.html',
    animatePages: animate
  });
}

function afterSignIn() {
  var homePage = $('#tab1 .cached');
  homePage.removeClass('cached');

  $('.tabbar').show(); //if you have .show() before load it animates

  // Fix statusbar and close splash
  document.addEventListener('deviceready', function() {
    navigator.splashscreen.hide();
    StatusBar.overlaysWebView(false);
    StatusBar.styleLightContent();
    StatusBar.backgroundColorByHexString("#eb7125");
  }, false);

  //close login screen
  mainView.router.load({
    pageName: 'tab1',
    animatePages: false
  });

  $('.navbar').show();
  homePage.removeClass('page-on-left');

  pushAfterLogin();
  initNotificationBadge();
  loadHome();
  getGroups();
}
