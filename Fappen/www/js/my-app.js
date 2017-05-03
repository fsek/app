// Initialize your app
var myApp = new Framework7();

// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
});

var tabview1 = myApp.addView('#tab1');
var tabview2 = myApp.addView('#tab2',{
	dynamicNavbar:true
});
var tabview3 = myApp.addView('#tab3');
var tabview4 = myApp.addView('#tab4');
var tabview5 = myApp.addView('#tab5');

/*$$('#tab2').on('tab:show', function () {
	 var a = document.getElementsByClassName("badge");
	 a[0].innerHTML = "";
});*/

// Callbacks to run specific code for specific pages, for example for About page:
myApp.onPageInit('about', function (page) {
	myApp.alert("pas");
});

$$('.sign-in-button').on('click', function () {
	var email = $$('.login-screen input[name="email"]').val();
	var password = $$('.login-screen input[name="password"]').val();
	if(password === "" || email === ""){
		myApp.alert("Please fill out both fields", "Error Message");
	}else{
    	//Lägg in kod för att jämföra med databasen här
    	myApp.showPreloader('Logging in');
    	setTimeout(function () {
    		myApp.hidePreloader();
    		myApp.alert('Email: ' + email + ', Password: ' + password);	
    		myApp.closeModal('.login-screen');
    	}, 1000);
    }
});