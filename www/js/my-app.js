// Initialize your app
var myApp = new Framework7({
    /*preroute: function (view, options) {
        if (!userLoggedIn) {
            view.router.loadPage('event.html'); //load another page with auth form
            return false; //required to prevent default router action
        }
    }*/
});

// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main');

var tabview1 = myApp.addView('#tab1',{
    dynamicNavbar:true
});
var tabview2 = myApp.addView('#tab2',{
    dynamicNavbar:true
});
var tabview3 = myApp.addView('#tab3',{
    dynamicNavbar:true
});
/*var tabview4 = myApp.addView('#tab4',{
    dynamicNavbar:true
});*/




var sentMessage = 0; /*Sämsta lösningen ever*/

/*$$('#tab2').on('tab:show', function () {
	 console.log('tab2 klickad');
});*/



/*======================================================
    ************        Calendar           ************
========================================================*/
var monthNames = ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti' , 'September' , 'Oktober', 'November', 'December'];
var eventDays = [new Date(2017,05,4), new Date(2017,05,10)]; 
var clickedDay = new Date(); //datumet och tiden just nu

var calendar = myApp.calendar({
    container: '#calendar',
    dateFormat: 'mm dd yyyy',
    dayNamesShort: ['S', 'M', 'T', 'O', 'T', 'F', 'L'], 
    touchmove: true,
    weekHeader: true,
    cssClass: 'calendar',
    /*weekLayout: true,*/
    events: eventDays,
    toolbarTemplate:'',
        /*'<div class="toolbar calendar-custom-toolbar">' +
            '<div class="toolbar-inner">' +
                '<div class="right">' +
                    '<a href="#" class="link icon-only">Today</a>' +
                '</div>' +
            '</div>' +
        '</div>',*/

    onOpen: function (p) {
        $$('.calendar-custom-toolbar .left').text(monthNames[p.currentMonth] +', ' + p.currentYear);
        $$('.calendar-custom-toolbar .right .link').on('click', function () {
            myApp.alert('idag är det kalas');
        });
        console.log(clickedDay);
        //$$('.weekday-content').scrollTop( $$('.weekday-content').offset().top, 500);
    },
    onMonthYearChangeStart: function (p) {
        $$('.calendar-custom-toolbar .left').text(monthNames[p.currentMonth] +', ' + p.currentYear);
    },
    onDayClick: function(p, dayContainer, year, month, day) {
        /*hämta event data från databasen om det klickade datumet*/
        month++;
        clickedDay = new Date(year,month,day);
        console.log('Year: ' + clickedDay.getFullYear() + ', Month: ' + clickedDay.getMonth()
         + ', Day: ' + clickedDay.getDate());
        $$('.day-content').empty();
        if(year == 2017 && month == 06 && day == 10){
            $$('.day-content').append(
                '<a href="event.html">' + 
                    '<div class="row event">' + 'KALAS' + '</div>' +
                '</a>'
            );
        }
        else if(year == 2017 && month == 06 && day == 4){
            $$('.day-content').append(
                '<a href="event.html">' + 
                    '<div class="row event">' + 'PLUGGZZZ' + '</div>' +
                '</a>'+
                '<a href="event.html">' + 
                    '<div class="row event">' + 'PLUGGZZZ' + '</div>' +
                '</a>'+
                '<a href="event.html">' + 
                    '<div class="row event">' + 'PLUGGZZZ' + '</div>' +
                '</a>'+
                '<a href="event.html">' + 
                    '<div class="row event">' + 'PLUGGZZZ' + '</div>' +
                '</a>'
            );
        }else{
            $$('.day-content').append('Inga event idaoo :(');
        }
    }
});

$$('.week-month-trigger').on('click', function () {
    if(calendar.weekLayoutToggle()){ //blir true om vi har bytt till weekLayout
        $$('.calendar').css('height', '60px');
    }else{
        $$('.calendar').css('height', '320px');
    }
    $$('.calendar').addClass('transition');
});

myApp.onPageBack('event', function (page) {
    $$('.tabbar').show();
    $$('.toolbar').show();
});

myApp.onPageInit('event', function (page) {
    $$('.tabbar').hide();
    $$('.toolbar').hide();
});

myApp.onPageInit('event', function (page) {
    /*lägger in den specifika eventinfo som html för dagen 'clickedDay'*/
    $$('.event-title').empty();
    if(clickedDay.getFullYear() == 2017 && clickedDay.getMonth() == 6 && clickedDay.getDate() == 10){
        $$('.event-title').append('KALAS');
        $$('.event-info').append('<h2>' + 'KALAS JIPPIE' + '</h2>');
    }
    else if(clickedDay.getFullYear() == 2017 && clickedDay.getMonth() == 6 && clickedDay.getDate() == 4){
        $$('.event-title').append('PLUGG');
        $$('.event-info').append('<h2>' + 'PLUGGA NOOES' + '</h2>');
    }
});


/*======================================================
    ************        Log in           ************
========================================================*/
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
            myApp.alert('Email: ' + email + '; Password: ' + password); 
            myApp.closeModal('.login-screen');
        }, 1000);
    }
});

$$('.login-info').on('click', function () {
    myApp.closeModal('.login-screen');
});



/*======================================================
    ************        Chat            ************
========================================================
$$(document).on('pageInit', function(e) {
    var page = e.detail.page;
    if(page.name === 'fadderchat' || page.name === 'foschat'){
        sentMessage = 0; /*senaste meddelandet*'/
        $$('.send-message').on('click', function () {
            var name = 'Fredrik Lastow' /*Hämta vad användaren heter*'/
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
}); */
