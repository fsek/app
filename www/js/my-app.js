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
var tabview4 = myApp.addView('#tab4',{
    dynamicNavbar:true
});
var tabview5 = myApp.addView('#tab5');

var sentMessage = 0; /*Sämsta lösningen ever*/

/*$$('#tab2').on('tab:show', function () {
	 var a = document.getElementsByClassName("badge");
	 a[0].innerHTML = "";
});*/
$$('.sign-in-button').on('click', function () {
    var email = $$('input[name="email"]').val();
    var password = $$('input[name="password"]').val();
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

$$(document).on('pageInit', function(e) {

    var page = e.detail.page;
    
    if(page.name === 'fadderchat' || page.name === 'foschat'){
        sentMessage = 0;
        /*Send message in the chat*/
        /*måste hålla koll på vem som skickade det senaste meddelandet*/
        $$('.send-message').on('click', function () {
            var name = 'Fredrik Lastow'
            var message = $$('input[name="message"]').val();
            if(sentMessage === 0){
                $$('.messages').append('<div class="message message-sent message-first message-appear-from-bottom">'
                + '<div class="message-name">'
                    + name
                + '</div>'
                + '<div class="message-text">'
                    + message
                + '</div>'
                + '</div>');
                sentMessage = 1;
            }else{
                $$('.messages').append('<div class="message message-sent message-appear-from-bottom">'
                + '<div class="message-name">'
                    + name
                + '</div>'
                + '<div class="message-text">'
                    + message
                + '</div>'
                + '</div>');
            }
            
            $$('input[name="message"]').val(''); 
        });
    }
});

myApp.onPageBack('fadderchat', function (page) {
    $$('.tabbar').show();
});

myApp.onPageInit('fadderchat', function (page) {
    $$('.tabbar').hide();
});

myApp.onPageBack('foschat', function (page) {
    $$('.tabbar').show();
});

myApp.onPageInit('foschat', function (page) {
    $$('.tabbar').hide();
});
