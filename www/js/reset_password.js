myApp.onPageInit('reset-password', function (page) {
    $('.reset-password-btn').on('click', function(){
        var email = $('input[name="reset-password-email"]').val();

        $.auth.requestPasswordReset({
            email: email
        })
        .done(function(){
            handleInputError('reset-password-email', null);

        })
        .fail(function(resp){
            mainView.router.load({
                url: 'reset_password_confirmation.html',
                reload: true,
                context: {
                    email: email
                }
            });

        });
    });

    scaleTitle('reset-password');
});

myApp.onPageInit('reset-password-confirmation', function (page) {
    scaleTitle('resetpw-confirm');
});