myApp.onPageInit('signup', function (page) {
  $('.signup-btn').on('click', function(){
    var firstName = $('input[name="signup-firstname"]').val();
    var lastName = $('input[name="signup-lastname"]').val();
    var email = $('input[name="signup-email"]').val();
    var password = $('input[name="signup-password"]').val();
    var passwordConfirm = $('input[name="signup-password_confirmation"]').val();

    $.auth.emailSignUp({
        firstname: firstName,
        lastname: lastName,
        email: email,
        password: password,
        password_confirmation: passwordConfirm
    })
    .done(function(){
      loginView.router.load({
        url: 'signup_confirmation.html',
        reload: true,
        context: {
          firstname: firstName,
          lastname: lastName,
          email: email,
        }
      });
    })
    .fail(function(resp){
      $('.signup-content input').each(function(){
        var errorID = this.name.replace('signup-', '');
        handleInputError(this.name, resp.data.errors[errorID]);
      });
    });
  });

  var head = $(page.container);
  var form = head.find('#signup-form');
  var footer = head.find('.signup-footer');

  head.on('focus', 'input', function(e) {
    footer.fadeOut();

    // Animated scroll for android
    if(myApp.device.android) {
      var scrollMargin = 65 * (form.find('input').index(this) - 1);
      form.find('ul').animate({scrollTop: scrollMargin}, 250);
    }
  });

  head.on('blur', 'input', function(e) {
    // Don't continue if we switched to another input field
    if(e.relatedTarget) return;

    setTimeout(function() {
      footer.fadeIn();
    }, 250);
  });
});

function handleInputError(name, error){
  var item = $('input[name="' + name + '"]').parents('.item-content');
  if(error != null){
    if(!item.hasClass('error')){
      item.addClass('error');
      item.after(
        '<li class="item-content error-message">'+
            '<div class="item-title">' + '* ' + error + '</div>' +
          '</li>'
        );
    }else{
      item.next()[0].innerText = '* ' + error; //updating error message
    }

    if(name == 'signup-password' || name == 'signup-password_confirmation'){
      $('input[name="signup-password"]')[0].value = '';
      $('input[name="signup-password_confirmation"]')[0].value = '';
    }
  }else if(item.hasClass('error')){
    item.removeClass('error');
    item.next().remove();
  }
}
