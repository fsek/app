let loadingEvents = false, loadingNews = false;
let lastEvent = false, page = 2, start = new Date();
const nbrOfEvents = 7;

$$(document).on('page:init', '.page[data-name="home"]', function () {
  // If signed in
  if (!jQuery.isEmptyObject($.auth.user)) {
    loadHome();
  }

  $$('#subtab-news').on('ptr:refresh', function() {
    initHome(ptr = 'news');
  });

  $$('#subtab-event').on('ptr:refresh', function() {
    initHome(ptr = 'event');
  });
});

$$('#home-btn').on('click', function() {
  $$('.page-content').scrollTop(0, 0);
});

function loadHome() {
  if (!$$('#view-home .page').hasClass('loaded')) {
    $$('#view-home .page').addClass('loaded');
    initHome(ptr = 'both');
  }
}

function initHome(ptr) {
  let newsList = $('#news-list'), newsTab = $('#subtab-news');
  let eventList = $('#event-list'), eventTab = $('#subtab-event');

  let totalPages = 37;
  const fadeInTime = 600;

  // Update correct subtab
  if (ptr === 'news') {
    app.infiniteScroll.create($('#subtab-news'));
    newsTab.find('subtab-list').empty();
    newsTab.find('.infinite-scroll-preloader').hide();
    newsList.empty();
    page = 2;
    initNews();
  } else if (ptr === 'event') {
    app.infiniteScroll.create($('#subtab-event'));
    eventTab.find('subtab-list').empty();
    eventTab.find('.infinite-scroll-preloader').hide();
    eventList.empty();
    eventTab.find('p').empty();
    lastEvent = false;
    start = new Date();
    loadMoreEvents();
  } else {
    initNews();
    loadMoreEvents();
  }

  function initNews() {
    $.getJSON(API + '/start')
      .done(function(resp) {
        addNews(resp.pinned.news.concat(resp.unpinned.news));
        totalPages = resp.unpinned.meta.total_pages;
        app.ptr.done($$('#subtab-news'));
        newsTab.find('.infinite-scroll-preloader').show();
      });
  }

  function addNews(news) {
    let templateHTML = app.templates.newsTemplate({news: news});
    $(templateHTML).hide().appendTo(newsList).fadeIn(fadeInTime);
  }

  function destroyNewsInfinite() {
    app.infiniteScroll.destroy(newsTab);
    newsTab.find('.infinite-scroll-preloader').hide();
  }

  function loadMoreNews() {
    $.getJSON(API + '/news?page=' + page)
      .then(function(resp) {
        addNews(resp.news);
        page++;
        app.ptr.done($$('#subtab-news'));
        loadingNews = false;
        if (page >= totalPages) {
          destroyNewsInfinite();
        }
      });
  }

  function moreNews() {
    if (!loadingNews) {
      loadingNews = true;
      loadMoreNews();
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
    eventTab.find('.infinite-scroll-preloader').hide();
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
      loadingEvents = true;
      loadMoreEvents();
    }
  }

  function loadMoreEvents() {
    $.getJSON(API + '/events/scroll?start=' + start.yyyymmdd())
      .then(function(resp) {
        res = resp.events;
        if (res.length < nbrOfEvents) {
          lastEvent = true;
          destroyEventInfinite();
        } else {
          start = new Date(res[res.length - 1].start);
          start.setDate(start.getDate() + 1);
          eventTab.find('.infinite-scroll-preloader').show();
        }
        initEventStream(res);
        app.ptr.done($$('#subtab-event'));
        loadingEvents = false;
      });
  }

  newsTab.on('infinite', moreNews);
  eventTab.on('infinite', moreEvents);
}
