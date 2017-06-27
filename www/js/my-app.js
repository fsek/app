/*======================================================
    ************        Content           ************
                    1. Log in
                    2. Calendar
========================================================*/

// Initialize your app
var myApp = new Framework7({
    preroute: function (view, options) {
        if (!userLoggedIn) {
            view.router.loadPage('event.html'); //load another page with auth form
            return false; //required to prevent default router action
        }
    }
});

// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main');

var tabView1 = myApp.addView('#tab1',{
    dynamicNavbar:true
});
var tabView2 = myApp.addView('#tab2',{
    dynamicNavbar:true
});
var tabView3 = myApp.addView('#tab3',{
    dynamicNavbar:true
});



$.auth.configure({
  apiUrl: 'https://stage.fsektionen.se/api'
});


/*var sentMessage = 0; Sämsta lösningen ever*/

/*$$('#tab2').on('tab:show', function () {
	 console.log('tab2 klickad');
});*/


/*======================================================
    ************        Log in           ************
========================================================*/
var userLoggedIn = false;

$$('.sign-in-btn').on('click', function () {
    var email = $$('input[name="email"]').val();
    var password = $$('input[name="password"]').val();
    if(password === "" || email === ""){
        myApp.alert("Please fill out both fields", "Login failed");
    }else{
        $.auth.emailSignIn({
            email: email, 
            password: password
        })
            .then(function() {
                userLoggedIn = true;
                myApp.closeModal('.login-screen');
                console.log('Welcome ' + $.auth.user.firstname + '!', "Login successful");
                initCalendar();
            })
            .fail(function(resp) {
                console.log('Authentication failure: ' + resp.reason, "Login failed");
            });
    }
});

$$('.login-info').on('click', function () {
    console.log('info click');
});



/*======================================================
    ************        Calendar           ************
========================================================*/
var clickedEvent = '';
var events = [];
function initCalendar(){
    if(userLoggedIn){
        //Events
        $.getJSON('https://stage.fsektionen.se/api/events')//OBSOBSOIBNS fixa så att man inte hämta all data samtidigt och sparar den!!!!
            .then(function(resp) {
                events = resp.events;
                var eventDays = [];
                for(i = 0; i < events.length; i++){
                    var eventDate = JSON.stringify(events[i].start); //YYYY-MM-DDThh:mm:ss+02:00 <-- start date template
                    eventDays.push(new Date(eventDate.substr(1, 4), eventDate.substr(6, 2)-1, eventDate.substr(9, 2)));
                }
                //eventDays.push(new Date(2017,5,27));
                openCalendar(eventDays); //F7 initiseringen av kalendern
            })
            .fail(function(resp) {
                console.log(resp.status, resp.statusText);
            });

        myApp.onPageInit('event', function (page) {
            console.log('event opened');
            $$('.tabbar').hide();
            $$('.toolbar').hide();

            $.getJSON('https://stage.fsektionen.se/api/events/' + clickedEvent, function(jd){
                $$('.event-info').empty();
                $$('.event-info').append(
                    '<div class="event-title">' + jd.event.title + '</div>' +
                    '<div class="event-time">' + jd.event.starts_at + '-' + jd.event.ends_at + '</div>' +
                    '<div class="event-place">' + jd.event.place + '</div>' +
                    '<div class="event-dress-code">' + jd.event.dress_code + '</div>' +
                    '<div class="event-food">' + jd.event.food + '</div>' +
                    '<div class="event-drink">' + jd.event.drink + '</div>' +
                    '<div class="event-price">' + jd.event.price + '</div>' +
                    '<div class="event-description">' + jd.event.description + '</div>'
                );
            })

            $$('.back').on('click', function(){
                $$('.event-info').empty();
            })

            $$('.event-signup-btn').on('click', function(){
                console.log('signup pressed');
                $.ajax({
                    url: 'https://stage.fsektionen.se/api/events/1/event_users',
                    type: 'POST',
                    dataType: 'json',
                    data: {
                      event_user: {group_custom: 'Godtycklig grupp'}
                    },
                    success: function(resp) {
                      alert(JSON.stringify(resp));
                    }
                });
            })
        });

        myApp.onPageBack('event', function (page) {
            $$('.tabbar').show();
            $$('.toolbar').show();

        });


    }
}

function openCalendar(eventDays){
    var monthNames = ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 
        'Augusti' , 'September' , 'Oktober', 'November', 'December'];

    //Initialization
    var calendar = myApp.calendar({
        container: '#calendar',
        dayNamesShort: ['S', 'M', 'T', 'O', 'T', 'F', 'L'], 
        touchmove: true,
        weekHeader: true,
        cssClass: 'calendar',
        /*weekLayout: true,*/
        events: eventDays,
        toolbarTemplate:'',

        //Callbacks
        onOpen: function (p) {
            var today = new Date();
            $$('.calendar-custom-toolbar .left').text(monthNames[p.currentMonth] +', ' + p.currentYear);        
            $$('.calendar-custom-toolbar .right .link').on('click', function () {
                if(p.currentYear !== today.getFullYear() || p.currentMonth !== today.getMonth()){
                    calendar.setYearMonth(today.getFullYear(), today.getMonth());
                    calendar.setValue([today]);
                }
            });
            var todayContainer = p.container[0].querySelector('.picker-calendar-day-today');
            displayDayContent(todayContainer, today);
        },
        onMonthYearChangeStart: function (p) {
            $$('.calendar-custom-toolbar .left').text(monthNames[p.currentMonth] +', ' + p.currentYear);
        },
        onDayClick: function(p, dayContainer, year, month, date) {
            displayDayContent(dayContainer, new Date(year, month, date));
        }
    });
}

function displayDayContent(dayContainer, day){
    var displayedEvents = [];
    $$('.day-content').empty();
    if(dayContainer.outerHTML.indexOf('picker-calendar-day-has-events') !== -1){
        for(i = 0; i < events.length; i++){
            var eventDate = JSON.stringify(events[i].start);
            var tempDay = new Date(eventDate.substr(1, 4), eventDate.substr(6, 2)-1, eventDate.substr(9, 2));
            if(day.getFullYear() === tempDay.getFullYear() && day.getMonth() === tempDay.getMonth() && day.getDate() === tempDay.getDate()){
                $$('.day-content').append('<a href="event.html" class="day-content-event">' + JSON.stringify(events[i]) + '</a>');
                displayedEvents.push(events[i].id);
            }
        }
    }else{
        $$('.day-content').append('inga event idaoo :(');
    }

    //konfiguration av event länken
    $$('.day-content-event').on('click', function (e) {
        console.log(displayedEvents);
        var dayEvents = this.parentNode.childNodes;
        for(i = 0; i < dayEvents.length; i++){
            if(this == dayEvents[i]){
                clickedEvent = displayedEvents[i];   
            }
        }
    });
}

/*$$('.week-month-trigger').on('click', function () {
    if(calendar.weekLayoutToggle()){ //blir true om vi har bytt till weekLayout
        $$('.calendar').css('height', '60px');
    }else{
        $$('.calendar').css('height', '320px');
    }
    $$('.calendar').addClass('transition');
});*/


/*======================================================
    ************        Chat            ************
========================================================
$$(document).on('pageInit', function(e) {
    var page = e.detail.page;
    if(page.name === 'fadderchat' || page.name === 'foschat'){
        $$('.page-content messages-content').append('')...
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
