var clickedEvent = '';
var firstInit = true;

function initCalendar(){
    if($.auth.user.signedIn) {
        var calendar = myApp.calendar({
            container: '#calendar',
            dayNamesShort: ['S', 'M', 'T', 'O', 'T', 'F', 'L'],
            touchmove: true,
            weekHeader: true,
            cssClass: 'calendar',
            events: [],
            toolbarTemplate:'',

            //Callbacks
            onOpen: function (p) {
                firstInit = false;
                var today = new Date();

                //Adding events
                loadEvents(p, $('.picker-calendar-month'));

                //Today link
                $('.calendar-custom-toolbar .right .link').on('click', function () {
                    if(p.currentYear !== today.getFullYear() || p.currentMonth !== today.getMonth()){
                        calendar.setYearMonth(p.currentYear, p.currentYear);
                        calendar.setValue([today]);
                    }
                });

                //Display today's month + year in toolbar
                $('.calendar-custom-toolbar .left').text(p.params.monthNames[today.getMonth()] +', ' + today.getFullYear());

                //Display today's event content
                var todayContainer = $('.picker-calendar-month-current .picker-calendar-day-today');
                displayDayContent(p, todayContainer, today);
            },
            onMonthYearChangeStart: function (p, year, month) {
                //Updating current month's events
                $.getJSON(API + '/events')
                    .done(function(resp) {
                        p.params.events = [];
                        for(i = 0; i < resp.events.length; i++){
                            var JSONDate = JSON.stringify(resp.events[i].start);
                            var eventDate = new Date(JSONDate.substr(1, 4), JSONDate.substr(6, 2)-1, JSONDate.substr(9, 2));
                            $('.picker-calendar-month-current .picker-calendar-day-has-events').not('.picker-calendar-day-prev, .picker-calendar-day-next').each(function(){
                                var dayContainer = $(this);
                                if(eventDate.getFullYear() == dayContainer.attr('data-year') && eventDate.getMonth() == dayContainer.attr('data-month') && eventDate.getDate() == dayContainer.attr('data-day')){
                                    resp.events[i].start = eventDate;
                                    p.params.events.push(resp.events[i]);
                                }
                            });
                        }
                    })
                    .fail(function(resp) {
                        console.log(resp.statusText);
                    });

                //Month  and year text in navbar
                $('.calendar-custom-toolbar .left').text(p.params.monthNames[p.currentMonth] + ', ' + p.currentYear);

            },
            onMonthAdd: function (p, monthContainer) {
                if(!firstInit){
                    loadEvents(p, $(monthContainer));
                }
            },
            onDayClick: function(p, dayContainer, year, month, date) {
                displayDayContent(p.params.events, $(dayContainer));
            }
        });
    }
}

function loadEvents(p, monthContainers){
    $.getJSON(API + '/events')
        .done(function(resp) {
            for(i = 0; i < resp.events.length; i++){
                var JSONDate = JSON.stringify(resp.events[i].start);
                var eventDate = new Date(JSONDate.substr(1, 4), JSONDate.substr(6, 2)-1, JSONDate.substr(9, 2), JSONDate.substr(12, 2), JSONDate.substr(15, 2)); //JSONdate format "YYYY-MM-DDThh:mm:ss+02:00"
                monthContainers.each(function(){
                    var monthContainer = $(this);
                    var monthDiff = Math.abs(monthContainer.attr('data-month')-eventDate.getMonth())
                    if(monthContainer.attr('data-year') == eventDate.getFullYear() && monthDiff <= 1 || monthDiff == 11){
                        monthContainer.find('.picker-calendar-day').each(function(){
                            var dayContainer = $(this);
                            if(eventDate.getFullYear() == dayContainer.attr('data-year') && eventDate.getMonth() == dayContainer.attr('data-month') && eventDate.getDate() == dayContainer.attr('data-day')){
                                dayContainer.addClass('picker-calendar-day-has-events');
                                if(monthContainer.hasClass('picker-calendar-month-current') && monthDiff == 0){
                                    resp.events[i].start = eventDate;
                                    p.params.events.push(resp.events[i]);
                                }
                            }
                        });
                    }
                });
            }
        })
        .fail(function(resp) {
            console.log(resp.statusText);
        });
}

function displayDayContent(events, dayContainer){
    var displayedEvents = [];
    $('.day-content').empty();
    if(dayContainer.hasClass('picker-calendar-day-has-events')){
        for(i = 0; i < events.length; i++){
            var eventDate = events[i].start;
            if(eventDate.getFullYear() == dayContainer.attr('data-year') && eventDate.getMonth() == dayContainer.attr('data-month') && eventDate.getDate() == dayContainer.attr('data-day')){
                displayedEvents.push(events[i]);
            }
        }
        //Sort by start time
        displayedEvents.sort(function(a, b){
            return a.start.toLocaleString().localeCompare(b.start.toLocaleString());
        });
        //displaying events
        displayedEvents.forEach(function(element){
            $('.day-content').append('<a href="event.html" class="day-content-event">' + JSON.stringify(element) + '</a>');
        });
    }else{
        $('.day-content').append('inga event idaoo :(');
    }

    //Configuration of the event page link
    $('.day-content-event').on('click', function (e) {
        var index = Array.prototype.indexOf.call(this.parentNode.children, this);
        clickedEvent = displayedEvents[index].id;
    });
}

//Configuration of the event page
myApp.onPageInit('event', function (page) {
    var eventData = '';
    console.log('event opened');
    $('.tabbar').hide();
    $('.toolbar').hide();

    $.getJSON(API + '/events/' + clickedEvent)
        .done(function(resp){
            eventData = resp;
            console.log(resp.event);
            for(var key in resp.event){
                var keyValue = resp.event[key];
                if(keyValue !== null && keyValue.length !== 0 && keyValue !== false){
                    console.log(key + ':', resp.event[key]);
                }
            }
            $('.event-info').empty();
            $('.event-info').append(
                '<div class="event-title">' + resp.event.title + '</div>' +
                '<div class="event-time">' + resp.event.starts_at + '-' + resp.event.ends_at + '</div>' +
                '<div class="event-place">' + resp.event.location + '</div>' +
                '<div class="event-dress-code">' + resp.event.dress_code + '</div>' +
                '<div class="event-food">' + resp.event.food + '</div>' +
                '<div class="event-drink">' + resp.event.drink + '</div>' +
                '<div class="event-price">' + resp.event.price + ' kr</div>' +
                '<div class="event-description">' + resp.event.description + '</div>'
            );
        })
        .fail(function(resp){
            console.log(resp.statusText);
        });


    $('.back').on('click', function(){
        $('.event-info').empty();
    })

    $('.event-signup-btn').on('click', function(){
        console.log('signup pressed', eventData);
        $.ajax({
            url: API + '/events/' + clickedEvent + '/event_users',
            type: 'POST',
            dataType: 'json',
            data: {
              event_user: {group_custom: 'Godtycklig grupp'}
            },
            success: function(resp) {
              alert(JSON.stringify(resp));
            },
            fail: function(resp) {
                console.log(resp.statusText);
            }
        });
    })
});

myApp.onPageBack('event', function (page) {
    $('.tabbar').show();
    $('.toolbar').show();
});



/*$('.week-month-trigger').on('click', function () {
    if(calendar.weekLayoutToggle()){ //blir true om vi har bytt till weekLayout
        $('.calendar').css('height', '60px');
    }else{
        $('.calendar').css('height', '320px');
    }
    $('.calendar').addClass('transition');
});*/
