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
        	myApp.alert('Account created. Email verification has been sent to your email');
        })
        .fail(function(resp){
        	mainView.router.load({
                url: 'signup_confirmation.html',
                reload: true,
                context: {
                	firstname: firstName,
                    lastname: lastName,
                    email: email,
                    signup: true
                }
            });
        	/*$('.signup-content input').each(function(){
        		var errorID = this.name.replace('signup-', '');
        		handleInputError(this.name, resp.data.errors[errorID]);
        	});*/
        });        
    });

    scaleTitle('signup');
});

function handleInputError(name, error){
	var item = $('input[name="' + name + '"]').offsetParent();
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

function scaleTitle(name){ //temporär lösning på skalningen av titeln (ville se hur det såg ut :))
    var title = $('.' + name + '-content .content-block-title');
    var fontSize = title.css('font-size').replace('px', '') * (title.width() / 290);
    title.css('font-size', fontSize);
}

myApp.onPageInit('signup-confirmation', function (page) {
    scaleTitle('signup-confirm');
});