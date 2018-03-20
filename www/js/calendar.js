// Init calendar if not already inited
$$(document).on('page:init', '.page[data-name="calendar"]', function (e) {
  var page = $('.page.calendar-page');

  // If signed in and calendar container is empty
  if(!jQuery.isEmptyObject($.auth.user) && page.find('#calendar').is(':empty')) {   
    initCalendar(page);
  }
});

function initCalendar(page) {
  var navbar = null;
  var firstInit = true;

  // Initialize F7 calendar
  var calendar = app.calendar.create({
    containerEl: page.find('#calendar'),
    value: [new Date()],
    events: [],
    dayNamesShort: dayNamesShort,
    monthNames: monthNames,
    touchMove: true,
    weekHeader: true,
    toolbar: false,
    on: {
      open: function (p) {
        firstInit = false;
        navbar = $(app.navbar.getElByPage(page));

        // Adding events
        loadEvents(p, page.find('.calendar-month'), true);
        setNavbarDate(p);

        // Initialize "today click" listener
        navbar.find('.right').on('click', todayClick);
      },
      monthYearChangeStart: function (p, year, month) {
        p.params.events = [];
        loadEvents(p, page.find('.calendar-month'), true);
        setNavbarDate(p);
      },
      monthAdd: function (p, monthContainer) {
        if(!firstInit) loadEvents(p, $$(monthContainer), false);
      },
      dayClick: function(p, dayContainer) {
        displayDayContent(p.params.events, $$(dayContainer));
      }
    }
  });

  function loadEvents(p, monthContainers, store) {
    var start = new Date(p.currentYear, p.currentMonth - 1, 1).yyyymmdd();
    var end = new Date(p.currentYear, p.currentMonth + 2, 0).yyyymmdd();

    $.getJSON(API + '/events?start=' + start + '&end=' + end)
    .done(function(resp) {
      for (var event of resp.events) {
        var eventDate = new Date(event.start);
        var dayContainer = findDay(eventDate, monthContainers);
        dayContainer.addClass('calendar-day-has-events');

        if (store && eventDate.getMonth() == p.currentMonth) {
          event.end = new Date(event.end);
          event.start = eventDate;
          p.params.events.push(event);
        }
      }
      updateDayContent(p);
    })
    .fail(function(resp) {
      console.log(resp.statusText);
    });
  }

  // Go to "today"
  function todayClick() {
    var today = new Date();
    calendar.setValue([today]);

    if (calendar.currentYear !== today.getFullYear() || calendar.currentMonth !== today.getMonth()) {
      calendar.setYearMonth(today.getFullYear(), today.getMonth());
    } else {
      var dayContainer = page.find('.calendar-day-today');
      displayDayContent(calendar.params.events, dayContainer);
    }
  }

  // Sets navbar to active month and year
  function setNavbarDate(p) {
    navbar.find('.left').text(monthNames[p.currentMonth] + ' ' + p.currentYear);
  }

  // Updates selected day if it's in the month currently pageed
  function updateDayContent(p) {
    var selectedDay = page.find('.calendar-day-selected');

    if (selectedDay.data('year') == p.currentYear && selectedDay.data('month') == p.currentMonth) {
      displayDayContent(p.params.events, selectedDay);
    }
  }

  function displayDayContent(events, dayContainer) {
    var displayedEvents = [];
    var hasEvents = false;
    var date = new Date(dayContainer.data('year'), dayContainer.data('month'), dayContainer.data('day'));

    if (dayContainer.hasClass('calendar-day-has-events')) {
      for (event of events) {
        if(sameDay(event.start, date)) displayedEvents.push(event);
      }

      // Sort by start time
      displayedEvents.sort(function(a, b) {
        return a.start.toLocaleString().localeCompare(b.start.toLocaleString());
      });

      hasEvents = true;
    }

    // Update day content
    var title = date.dateString();
    page.find('.day-title').html(title);

    var templateHTML = app.templates.dayTemplate({hasEvents: hasEvents, events: displayedEvents});
    page.find('.day-content').html(templateHTML);
    
  }

  // Finds the div for `date` in `monthContainers`
  function findDay(date, monthContainers) {
    return monthContainers.find('.calendar-day[data-year="' + date.getFullYear() + '"]' +
                                                    '[data-month="' + date.getMonth() + '"]' +
                                                    '[data-day="' + date.getDate() + '"]');
  }
}
