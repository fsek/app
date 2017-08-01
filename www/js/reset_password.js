myApp.onPageInit('reset-password', function (page) {
  $('.reset-password-btn').on('click', function(){
    var email = $('input[name="reset-password-email"]').val();

    $.auth.requestPasswordReset({
      email: email
    })
    .done(function(){
      mainView.router.load({
        url: 'reset_password_confirmation.html',
        reload: true,
        context: {
          email: email
        }
      });
    })
    .fail(function(resp){
      var error = '';
      if(email != ''){
        error = 'Ogiltig e-postaddress';
      }else{
        error = 'Måste anges';
      }
      handleInputError('reset-password-email', error);
    });
  });

  scaleTitle('reset-password');
});

myApp.onPageInit('reset-password-confirmation', function (page) {
  scaleTitle('resetpw-confirm');
});
