//init calendar on tab3 show (if not already init:ed)
$$('#tab2').on('show', function() {
  var page = $$('.page.calendar-page');
  if (page.find('#calendar').is(':empty')) {
    initCalendar(page);
  }
});

function initCalendar(page) {
  var toolbar = null;
  var firstInit = true;

  // Initialize F7 calendar
  var calendar = myApp.calendar({
    container: page.find('#calendar'),
    value: [new Date()],
    events: [],
    dayNamesShort: dayNamesShort,
    monthNames: monthNames,
    touchmove: true,
    weekHeader: true,
    toolbarTemplate: myApp.templates.calToolbarTemplate(),

    onOpen: function (p) {
      firstInit = false;
      toolbar = page.find('.calendar-custom-toolbar');

      // Adding events
      loadEvents(p, page.find('.picker-calendar-month'), true);
      setToolbarDate(p);

      // Initialize "today click" listener
      toolbar.find('.right').on('click', todayClick);
    },
    onMonthYearChangeStart: function (p, year, month) {
      p.params.events = [];
      loadEvents(p, page.find('.picker-calendar-month'), true);
      setToolbarDate(p);
    },
    onMonthAdd: function (p, monthContainer) {
      if(!firstInit) loadEvents(p, $$(monthContainer), false);
    },
    onDayClick: function(p, dayContainer) {
      displayDayContent(p.params.events, $$(dayContainer));
    }
  });

  function loadEvents(p, monthContainers, store) {
    var start = new Date(p.currentYear, p.currentMonth -1, 1).yyyymmdd();
    var end = new Date(p.currentYear, p.currentMonth +2, 0).yyyymmdd();

    $.getJSON(API + '/events?start=' + start + '&end=' + end)
    .then(function(resp) {
      for (var event of resp.events) {
        var eventDate = new Date(event.start);
        var dayContainer = findDay(eventDate, monthContainers);
        dayContainer.addClass('picker-calendar-day-has-events');

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
      var dayContainer = page.find('.picker-calendar-day-today');
      displayDayContent(calendar.params.events, dayContainer);
    }
  }

  // Sets toolbar to active month and year
  function setToolbarDate(p) {
    toolbar.find('.left').text(monthNames[p.currentMonth] + ' ' + p.currentYear);
  }

  // Updates selected day if it's in the month currently viewed
  function updateDayContent(p) {
    var selectedDay = page.find('.picker-calendar-day-selected');

    if (selectedDay.data('year') == p.currentYear && selectedDay.data('month') == p.currentMonth) {
      displayDayContent(p.params.events, selectedDay);
    }
  }

  function displayDayContent(events, dayContainer) {
    var displayedEvents = [];
    var hasEvents = false;
    var date = new Date(dayContainer.data('year'), dayContainer.data('month'), dayContainer.data('day'));

    if (dayContainer.hasClass('picker-calendar-day-has-events')) {
      for (event of events) {
        if(sameDay(event.start, date)) displayedEvents.push(event);
      }

      // Sort by start time
      displayedEvents.sort(function(a, b) {
        return a.start.toLocaleString().localeCompare(b.start.toLocaleString());
      });

      hasEvents = true;
    }

    var title = date.dateString();

    // Update day content
    var templateHTML = myApp.templates.dayTemplate({hasEvents: hasEvents, events: displayedEvents, date: date});
    page.find('.day-content').html(templateHTML);
    page.find('.day-title').html(title);
  }

  // Finds the div for `date` in `monthContainers`
  function findDay(date, monthContainers) {
    return monthContainers.find('.picker-calendar-day[data-year="' + date.getFullYear() + '"]' +
                                                    '[data-month="' + date.getMonth() + '"]' +
                                                    '[data-day="' + date.getDate() + '"]');
  }
}
