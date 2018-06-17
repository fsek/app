$$(document).on('page:init', '.page[data-name="signup"]', function (pageEvent) {
  const page = pageEvent.detail;
  const head = $(page.el).find('.page-content');

  const form = head.find('#signup-form');
  const formInput = form.find('input');
  const signupBtn = head.find('.signup-btn');
  const footer = head.find('.signup-footer');

  formInput.on('input', function() {
    let inputFilled = true;
    const signupFormData = app.form.convertToData(form);

    // Check if all fields a filled in
    for (const key in signupFormData) {
      if (signupFormData[key] === '') {
        inputFilled = false;
        break;
      }
    }
    
    // If filled in, enable else diable
    if (inputFilled) {
      if (signupBtn.hasClass('disabled')) {
        signupBtn.removeClass('disabled');
      }
    } else if (!signupBtn.hasClass('disabled')) {
      signupBtn.addClass('disabled');
    }
  });

  /*
   * Get the input data from the form and pass it in the auth request. If it fails we add errors,
   * otherwise we load the confirmation page with the input data as context to be displayed
   */
  signupBtn.on('click', function() {
    const signupFormData = app.form.convertToData(form);

    $.auth.emailSignUp(signupFormData)
      .done(function() {
        loginView.router.navigate('signup_confirm/', {
          context: signupFormData
        });
      })
      .fail(function(resp) {
        formInput.each(function() {
          let error = resp.data.errors[this.name];
          handleInputError(this, error, form);
        });
      });
  });

  head.on('focus', 'input', function() {
    footer.fadeOut();

    // Animated scroll for android
    if (app.device.android) {
      const scrollMargin = 65 * (formInput.index(this) - 1);
      head.animate({scrollTop: scrollMargin}, 250);
    }
  });

  head.on('blur', 'input', function(e) {
    // Don't continue if we switched to another input field
    if (e.relatedTarget) return;

    setTimeout(function() {
      footer.fadeIn();
    }, 250);
  });
});

/*
 * Add the error class (becomes red) and error message below the 
 * input field if there is an error otherwise remove it
 */
function handleInputError(inputEl, error, form) {
  const item = $(inputEl).parents('.item-content');
  if (error) {
    if (!item.hasClass('error')) {
      item.addClass('error');
      item.after(
        '<li class="item-content error-message">'+
          '<div class="item-title">' + '* ' + error + '</div>' +
        '</li>'
      );
    } else {
      item.next()[0].innerText = '* ' + error; //updating error message
    }

    if (inputEl.name === 'password' || inputEl.name === 'password_confirmation') {
      form.find('input[name="password"]').val('');
      form.find('input[name="password_confirmation"]').val('');
    }
  } else if (item.hasClass('error')) {
    item.removeClass('error');
    item.next().remove();
  }
}
