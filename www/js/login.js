// Redirect from the login screen if the user has signed in before
$.auth.validateToken()
  .done(function() {
    afterSignIn();
  })
  .fail(function(){
    loadLoginPage();
  });

myApp.onPageInit('login', function (page) {
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

  // Use a different statusbar color (just a test)
  document.addEventListener('deviceready', function() {
    StatusBar.backgroundColorByHexString("#7999d2");
  }, false);
});

function loadLoginPage(){
  mainView.router.load({
    url: 'login.html',
    animatePages: false
  });
}

function afterSignIn() {
  $('#tab1 .cached').removeClass('cached');
  $('.tabbar').show();
  StatusBar.backgroundColorByHexString("#eb7125");
  mainView.router.back({ //close login screen
    pageName: 'tab1',
    animatePages: false
  });
  pushAfterLogin();
  initNotificationBadge();
  loadHome();
  getGroups();
}
