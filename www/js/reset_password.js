$$(document).on('page:init', '.page[data-name="reset-password"]', function (page) {
  // Enable button if the input field isn't empty 
  $('#reset-password-form input').on('input', function(e) {
    var resetPwBtn = $('.reset-password-btn');
    var resetPwFormData = app.form.convertToData('#reset-password-form');

    if (resetPwFormData.email != '') {
      if (resetPwBtn.hasClass('disabled')) {
        resetPwBtn.removeClass('disabled');
      }
    } else if (!resetPwBtn.hasClass('disabled')) {
      resetPwBtn.addClass('disabled');
    }
  });

  /*
   * Get the input data from the form and pass it in the auth request. If it fails we add errors,
   * otherwise we load the confirmation page with the input data as context to be displayed
   */
  $('.reset-password-btn').on('click', function() {
    var resetPwFormData = app.form.convertToData('#reset-password-form');
    
    $.auth.requestPasswordReset(resetPwFormData)
      .done(function() {
        loginView.router.navigate('reset_password_confirm/', {
          context: resetPwFormData
        });
      })
      .fail(function(resp) {
        var error = 'Ogiltig e-postaddress';
        var inputEl = $('#reset-password-form input');
        handleInputError(inputEl, error); // Defined in signup.js
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
