$$(document).on('page:init', '.page[data-name="reset-password"]', function (pageEvent) {
  const page = pageEvent.detail;
  const head = $(page.el).find('.page-content');

  const resetPwBtn = head.find('.reset-password-btn');
  const form = head.find('#reset-password-form');
  const formInput = form.find('input');
  const footer = head.find('.reset-password-footer');

  // Enable button if the input field isn't empty
  formInput.on('input', function() {
    const resetPwFormData = app.form.convertToData(form);

    if (resetPwFormData.email !== '') {
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
  resetPwBtn.on('click', function() {
    const resetPwFormData = app.form.convertToData(form);

    $.auth.requestPasswordReset(resetPwFormData)
      .done(function() {
        loginView.router.navigate('reset_password_confirm/', {
          context: resetPwFormData
        });
      })
      .fail(function() {
        const error = 'Ogiltig e-postaddress';
        handleInputError(formInput, error); // Defined in signup.js
      });
  });

  head.on('focus', 'input', function() {
    footer.fadeOut();

    // Scroll the input to the center on Android
    if (app.device.android) {
      const scrollPos = resetPwBtn.offset().top + resetPwBtn.height();
      head.animate({scrollTop: scrollPos}, 250);
    }
  });

  head.on('blur', 'input', function() {
    setTimeout(function() {
      footer.fadeIn();
    }, 250);
  });
});
