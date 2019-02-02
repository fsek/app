// Init calendar if not already inited
$$(document).on('page:init', '.page[data-name="calendar"]', function () {
  const page = $('.page.calendar-page');

  // If signed in and calendar container is empty (triggers when going back from the third page in the view)
  if (!jQuery.isEmptyObject($.auth.user) && page.find('#calendar').is(':empty')) {
    initCalendar(page);
  }
});

function initCalendar(page) {
  let navbar = null;

  // Initialize F7 calendar
  const calendar = app.calendar.create({
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
        navbar = $(app.navbar.getElByPage(page));

        // Adding events
        loadEvents(p, page.find('.calendar-months'));
        setNavbarDate(p);

        // Initialize "today click" listener
        navbar.find('.right').on('click', todayClick);
      },
      monthYearChangeEnd: function (p) {
        p.params.events = [];
        loadEvents(p, page.find('.calendar-months'));
        setNavbarDate(p);
      },
      dayClick: function(p, dayContainer) {
        displayDayContent(p.params.events, $$(dayContainer));
      }
    }
  });

  function loadEvents(p, monthContainers) {
    const start = new Date(p.currentYear, p.currentMonth - 1, 1).yyyymmdd();
    const end = new Date(p.currentYear, p.currentMonth + 2, 0).yyyymmdd();

    $.getJSON(API + '/events?start=' + start + '&end=' + end)
      .done(function(resp) {
        for (const event of resp.events) {
          const eventDate = new Date(event.start);
          const dayContainer = findDay(eventDate, monthContainers);
          dayContainer.addClass('calendar-day-has-events');
          setRegisteredStatus(event);

          if (eventDate.getMonth() === p.currentMonth) {
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
    const today = new Date();
    calendar.setValue([today]);

    if (calendar.currentYear !== today.getFullYear() || calendar.currentMonth !== today.getMonth()) {
      calendar.setYearMonth(today.getFullYear(), today.getMonth());
    } else {
      const dayContainer = page.find('.calendar-day-today');
      displayDayContent(calendar.params.events, dayContainer);
    }
  }

  // Sets navbar to active month and year
  function setNavbarDate(p) {
    navbar.find('.left').text(monthNames[p.currentMonth] + ' ' + p.currentYear);
  }

  // Updates selected day if it's in the month currently pageed
  function updateDayContent(p) {
    const selectedDay = page.find('.calendar-day-selected');

    if (selectedDay.data('year') === p.currentYear && selectedDay.data('month') === p.currentMonth) {
      displayDayContent(p.params.events, selectedDay);
    }
  }

  function displayDayContent(events, dayContainer) {
    let displayedEvents = [];
    let hasEvents = false;
    let date = new Date(dayContainer.data('year'), dayContainer.data('month'), dayContainer.data('day'));

    if (dayContainer.hasClass('calendar-day-has-events')) {
      for (const event of events) {
        if (sameDay(event.start, date)) displayedEvents.push(event);
      }

      // Sort by start time
      displayedEvents.sort(function(a, b) {
        return a.start.toLocaleString().localeCompare(b.start.toLocaleString());
      });

      hasEvents = true;
    }

    // Update day content
    const title = date.dateString();
    page.find('.day-title').html(title);

    const templateHTML = app.templates.dayTemplate({hasEvents: hasEvents,
      events: displayedEvents});
    page.find('.day-content').html(templateHTML);

  }

  // Finds the div for `date` in `monthContainers`
  function findDay(date, monthContainers) {
    return monthContainers.find('.calendar-day[data-year="' + date.getFullYear() + '"]' +
                                                    '[data-month="' + date.getMonth() + '"]' +
                                                    '[data-day="' + date.getDate() + '"]');
  }
}

function setRegisteredStatus(eventData) {
  // Runs when the a calendar month is loaded
  if (eventData.has_signup) {
    let eventSignup = eventData.event_signup;
    eventSignup.opens = new Date(eventSignup.opens);
    signupCloses = new Date(eventSignup.closes);
    let registeredStatus, registeredStatusIcon;
    if (eventData.event_user !== null) {
      if (signupCloses < new Date()) {
        if (eventData.event_user.reserve) {
          registeredStatusIcon = 'fa-times-circle';
          registeredStatus = 'Du fick tyvärr ingen plats';
        } else {
          registeredStatusIcon = 'fa-check-circle';
          registeredStatus = 'Du har fått en plats!';
        }
      } else {
        registeredStatusIcon = 'fa-question-circle';
        registeredStatus = 'Du är anmäld, men inte fått en plats än';
      }
    } else {
      registeredStatusIcon = 'fa-exclamation-circle';
      registeredStatus = 'Du är inte anmäld';
    }
    eventData.registered_status_icon = registeredStatusIcon;
    eventData.registered_status = registeredStatus;
  }
}
