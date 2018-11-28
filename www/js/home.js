let loadingEvents = false, loadingNews = false;

$$(document).on('page:init', '.page[data-name="home"]', function () {
  // If signed in
  if (!jQuery.isEmptyObject($.auth.user)) {
    loadHome();
  }

  $$('#subtab-news').on('ptr:refresh', function() {
    app.infiniteScroll.create($('#subtab-news'));
    initHome(ptr = true);
  });

  $$('#subtab-event').on('ptr:refresh', function() {
    app.infiniteScroll.create($('#subtab-event'));
    initHome(ptr = true);
  });
});

$$('#home-btn').on('click', function() {
  $$('.page-content').scrollTop(0, 0);
});

function loadHome() {
  if (!$$('#view-home .page').hasClass('loaded')) {
    $$('#view-home .page').addClass('loaded');
    initHome();
  }
}

function initHome(ptr = false) {
  // Reset elements
  if (ptr) {
    $('#subtab-news').find('subtab-list').empty();
    $('#news-list').empty();
    $('#subtab-event').find('subtab-list').empty();
    $('#event-list').empty();
    $('#subtab-event').find('p').empty();
    app.ptr.done($$('#subtab-news'));
    app.ptr.done($$('#subtab-event'));
  }

  let fadeInTime = 600;

  let newsList = $('#news-list'), newsTab = $('#subtab-news');
  let eventList = $('#event-list'), eventTab = $('#subtab-event');

  let page = 2, totalPages = 37;
  let lastEvent = false, start = new Date();
  $.getJSON(API + '/start')
    .done(function(resp) {
      addNews(resp.pinned.news.concat(resp.unpinned.news));
      totalPages = resp.unpinned.meta.total_pages;
      loadMoreEvents();
    });

  function addNews(news) {
    let templateHTML = app.templates.newsTemplate({news: news});
    $(templateHTML).hide().appendTo(newsList).fadeIn(fadeInTime);
  }

  function destroyNewsInfinite() {
    app.infiniteScroll.destroy(newsTab);
    newsTab.find('.infinite-scroll-preloader').remove();
  }

  function loadMoreNews() {
    $.getJSON(API + '/news?page=' + page)
      .then(function(resp) {
        addNews(resp.news);
        page++;
        loadingNews = false;
      });
  }

  function moreNews() {
    if (!loadingNews) {
      if (page <= totalPages) {
        loadingNews = true;
        loadMoreNews();
      } else {
        destroyNewsInfinite();
      }
    }
  }

  function initEventStream(events) {
    let lastDay = null;

    if (events.length !== 0) {
      for (let event of events) {
        setRegisteredStatus(event);
        event.start = new Date(event.start);
        event.end = new Date(event.end);

        // Add header on new days
        if (lastDay !== event.start.getDate()) {
          dayHTML = app.templates.dayTitleTemplate({date: event.start});
          eventList.append(dayHTML);
        }
        let newsTemplateHTML = app.templates.dayTemplate({hasEvents: true,
          events: [event]});
        $(newsTemplateHTML).hide().appendTo(eventList).fadeIn(fadeInTime);
        lastDay = event.start.getDate();
      }
    }
    if (lastEvent) {
      let templateHTML = app.templates.dayTemplate({hasEvents: false});
      eventTab.append(templateHTML);
    }
  }

  function destroyEventInfinite() {
    app.infiniteScroll.destroy(eventTab);
    eventTab.find('.infinite-scroll-preloader').remove();
  }

  function setRegisteredStatus(eventData) {
    if (eventData.has_signup) {
      let eventSignup = eventData.event_signup;
      eventSignup.opens = new Date(eventSignup.opens);
      signupCloses = new Date(eventSignup.closes);
      let registeredStatus, registeredStatusIcon;
      if (eventData.event_user != null) {
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

  function moreEvents() {
    if (!loadingEvents) {
      if (!lastEvent) {
        loadingEvents = true;
        loadMoreEvents();
      } else {
        destroyEventInfinite();
      }
    }
  }

  function loadMoreEvents() {
    $.getJSON(API + '/events/scroll?start=' + start.yyyymmdd())
      .then(function(resp) {
        res = resp.events;
        if (res.length < 7) {
          lastEvent = true;
          destroyEventInfinite();
        } else {
          start = new Date(res[res.length - 1].start);
          start.setDate(start.getDate() + 1);
        }
        initEventStream(res);
        loadingEvents = false;
      });
  }

  newsTab.on('infinite', moreNews);
  eventTab.on('infinite', moreEvents);
}
