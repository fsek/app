// Redirect from the login screen if the user has signed in before
$.auth.validateToken()
    .done(function() {
        afterSignIn();
    });

$$('.sign-in-btn').on('click', function () {
    var email = $$('input[name="email"]').val();
    var password = $$('input[name="password"]').val();

    if(password === "" || email === ""){
        myApp.alert("Please fill out both fields", "Login failed");
    } else {
        $.auth.emailSignIn({
            email: email,
            password: password
        })
        .done(function() {
            afterSignIn();
        })
        .fail(function(resp) {
            console.log('Authentication failure: ' + resp.reason, "Login failed");
        });
    }
});

function afterSignIn() {
    myApp.closeModal('.login-screen');
    setupPush();
    initNotificationBadge();
    initCalendar();
}

