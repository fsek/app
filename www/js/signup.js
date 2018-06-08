$$(document).on('page:init', '.page[data-name="signup"]', function (page) {
  $('#signup-form input').on('input', function(e) {
    var inputFilled = true;
    var signupBtn = $('.signup-btn');
    var signupFormData = app.form.convertToData('#signup-form');

    // Check if all fields a filled in
    for (var key in signupFormData) {
      if (signupFormData[key] == '') {
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
  $('.signup-btn').on('click', function() {
    var signupFormData = app.form.convertToData('#signup-form');

    $.auth.emailSignUp(signupFormData)
      .done(function() {
        loginView.router.navigate('signup_confirm/', {
          context: signupFormData
        });
      })
      .fail(function(resp) {
        $('#signup-form input').each(function() {
          var error = resp.data.errors[this.name];
          handleInputError(this, error);
        });
      });
  });

  var head = $(page.container);
  var form = head.find('#signup-form');
  var footer = head.find('.signup-footer');

  head.on('focus', 'input', function(e) {
    footer.fadeOut();

    // Animated scroll for android
    if (app.device.android) {
      var scrollMargin = 65 * (form.find('input').index(this) - 1);
      form.find('ul').animate({scrollTop: scrollMargin}, 250);
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
function handleInputError(inputEl, error) {
  console.log(error);
  var item = $(inputEl).parents('.item-content');
  if (error != null) {
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

    if (inputEl.name == 'password' || inputEl.name == 'password_confirmation') {
      $('#signup-form input[name="password"]').val('');
      $('#signup-form input[name="password_confirmation"]').val('');
    }
  } else if (item.hasClass('error')) {
    item.removeClass('error');
    item.next().remove();
  }
}
