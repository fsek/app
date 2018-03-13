$$(document).on('page:init', '.page[data-name="reset-passworc"]', function (page) {
  $('.reset-password-btn').on('click', function(){
    var email = $('input[name="reset-password-email"]').val();

    $.auth.requestPasswordReset({
      email: email
    })
    .done(function(){
      loginView.router.load({
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

  $(page.container).on('focus', 'input', function(e) {
    $('.reset-password-footer').fadeOut();
  });

  $(page.container).on('blur', 'input', function(e) {
    setTimeout(function() {
      $('.reset-password-footer').fadeIn();
    }, 250);
  });
});
