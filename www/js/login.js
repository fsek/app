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
    mainView.router.back({ //close login screen
        pageName: 'tab1',
        animatePages: false
    });
    setupPush();
    initNotificationBadge();
    initCalendar();
}
