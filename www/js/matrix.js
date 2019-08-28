let nbrIntroductionWeeks;

$$(document).on('page:beforein', '.page[data-name="matrix"]', function() {
  $$('.navbar').removeAttr('id');
  StatusBar.backgroundColorByHexString(nollningBarColor);
});

$$(document).on('page:init', '.page[data-name="matrix"]', function (e) {
  const page = $(e.target);

  $.getJSON(API + '/events/matrix')
    .done(function(resp) {
      initMatrix(resp);
      page.find('.matrix-preloader').remove();
    })
    .fail(function(resp) {
      page.find('.matrix-preloader').remove();
      weekList = $$('#week-list');
      weekList.append('<div class="timeline-fail"> Kunde inte läsa in nollning :(</div>');
    });
});

function initMatrix(resp) {
  if (typeof resp.error === 'undefined') {
    initTimeline(resp);
    setBackgroundGradient();
    setTimeout(scrollToToday, 100);
  } else {
    // No introduction exists
    error = resp.error;
    weekList = $$('#week-list');
    weekList.append('<div class="timeline-fail"> ' + error + '</div>');
  }
}

function initTimeline(data) {
  let weekList = $$('#week-list');
  let week = 0;
  let lastDay = null;
  const fadeInTime = 600;

  // Data is filled with events grouped by week
  if (data.length !== 0) {
    // Loop over each week
    Object.keys(data).forEach(function(key) {
      // New timeline for each week
      matrixWeekHTML = app.templates.matrixWeekTemplate({week: week.toString()});
      $(matrixWeekHTML).hide().appendTo(weekList).fadeIn(fadeInTime);

      let weekEvents = data[key];
      let side = 'left';
      let timelineList = $('#timeline-list-week-' + week);

      for (i = 0; i < weekEvents.length; i++) {
        let event = weekEvents[i];

        setRegisteredStatus(event);
        setEventProgress(event);

        // Modify time if single or double dot
        event.start = new Date(event.start);
        event.time = event.start.hhmm();
        if (event.dot === 'single') {
          event.time += ' (.)';
        } else if (event.dot === 'double') {
          event.time += ' (..)';
        }

        // Add date and switch side of timeline if new day
        if (lastDay !== event.start.getDate()) {
          if (side === 'right') {
            side = 'left';
          } else {
            side = 'right';
          }
          matrixEventHTML = app.templates.matrixEventTemplate({date: event.start, side: side, event: event});
        } else {
          matrixEventHTML = app.templates.matrixEventTemplate({side: side, event: event});
        }
        $(matrixEventHTML).hide().appendTo(timelineList).fadeIn(fadeInTime);
        lastDay = event.start.getDate();
      }
      week += 1;
    });
    setLastEvent();
  }
  nbrIntroductionWeeks = week;
}

function setLastEvent() {
  // Finds the last event and sets correct divider class
  date = new Date();
  day = date.getDate();
  today = day + ' ' + date.getMonthName();

  // Find the last event
  data = $$('.timeline-item-divider.today-past');
  if (data.length === 0) {
    data = $$('.timeline-item-divider.past');
    if (data.length === 0) {
      // Current date before introduction
      return;
    }
  }
  last = data[data.length - 1];

  // Compare the date of the last event with current date
  let parent = last.parentElement;
  if (day > 9) {
    eventDate = parent.innerText.slice(0, 6);
  } else {
    eventDate = parent.innerText.slice(0, 5);
  }
  if (today === eventDate) {
    last.outerHTML = '<div class="timeline-item-divider today-last"></div>';
  } else {
    last.outerHTML = '<div class="timeline-item-divider last"></div>';
  }
}

function setEventProgress(event) {
  // Returns if event has already occured, if it is the next
  // event or if it is further in the future
  date = new Date();
  today = date.yyyymmdd();
  now = today + ' ' + date.hhmm();

  // Day and time of current and previous event
  eventDate = new Date(event.start);
  eventDay = eventDate.yyyymmdd();
  eventTime = eventDate.yyyymmdd() + ' ' + eventDate.hhmm();

  // Check if event is occuring today
  if (eventDay === today) {
    progress = 'today-';
  } else {
    progress = '';
  }

  // Check if event is in the past or in the future
  if (eventTime < now) {
    progress += 'past';
  } else {
    progress += 'future';
  }
  event.progress = progress;
}

function scrollToToday() {
  // Find today's first event
  date = $$('.timeline-item-divider.today-past');
  if (date.length === 0) {
    date = $$('.timeline-item-divider.today-last');
    if (date.length === 0) {
      date = $$('.timeline-item-divider.today-future');
      if (date.length === 0) {
        // No event today, look for event in future
        date = $$('.timeline-item-divider.future');
        if (date.length === 0) {
          // Current date is after introduction
          return;
        }
      }
    }
  }
  today = date[0];
  offset = $$('.navbar').height(); // Compensate for navbar
  today.style.top = '-' + offset*1.2 + 'px';
  today.scrollIntoView({behavior: 'smooth', block: 'start'});
  today.style.top = '0px';
}

function setBackgroundGradient() {
  // Calculates the height of each week in percentage of the whole page and
  // then sets a background gradient with the weekly colors using this information
  // weekColors should have the same length as the number of introduction weeks
  if (nbrIntroductionWeeks > 0 && nbrIntroductionWeeks === weekColors.length) {
    navBarHeight = $$('.navbar').height();
    contentHeight = $$('#week-list').height();
    pageHeight = contentHeight + navBarHeight;
    weekHeight = new Array(nbrIntroductionWeeks);
    background = 'linear-gradient(180deg, ' + weekColors[0] + ' 0%';
    for (let week = 0; week < nbrIntroductionWeeks - 1; week++) {
      height = $$('#timeline-container-week-' + week).height();
      weekHeight[week] = 100.0 * (height / contentHeight);
      background += ', ' + weekColors[week + 1] + ' ' + weekHeight.reduce((a, b) => a + b, 0) + '%';
    }
    background += ')';
    document.styleSheets[1].insertRule('.matrix-content::after { background: ' + background + '; height: ' + pageHeight + 'px; }', 0);
    document.styleSheets[0].cssRules[0].style.background = background;
    document.styleSheets[0].cssRules[0].style.height = height;
  }
}
