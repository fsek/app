$$(document).on('page:init', '.page[data-name="home"]', function () {
  // If signed in
  if (!jQuery.isEmptyObject($.auth.user)) {
    loadHome();
  }
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

function initHome() {
  let newsTab = $('#subtab-news');
  let eventTab = $('#subtab-event');

  let newsList = newsTab.find('#news-list');
  let eventList = eventTab.find('#event-list');

  let page = 2;
  let totalPages = 37;
  let loadingNews = false;

  let start = new Date();
  let loadingEvents = false;
  let lastEvent = false;

  const initialize = (function() {
    $.getJSON(API + '/start')
      .then(function(resp) {
        addNews(resp.pinned.news.concat(resp.unpinned.news));
        totalPages = resp.unpinned.meta.total_pages;
        loadMoreEvents();
      });
  }());

  function addNews(news) {
    let templateHTML = app.templates.newsTemplate({news: news});
    $(templateHTML).hide().appendTo(newsList).fadeIn(1000);
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

    if (events.length != 0) {
      for (let event of events) {
        event.start = new Date(event.start);
        event.end = new Date(event.end);

        // Add header on new days
        if (lastDay != event.start.getDate()) {
          dayHTML = app.templates.dayTitleTemplate({date: event.start});
          eventList.append(dayHTML);
        }

        let templateHTML = app.templates.dayTemplate({hasEvents: true,
          events: [event]});
        eventList.append(templateHTML);
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
        } else {
          last_date = new Date(res[res.length - 1].start);
          start.setDate(last_date.getDate() + 1);
        }
        initEventStream(res);
        loadingEvents = false;
      });
  }

  newsTab.on('infinite', moreNews);
  eventTab.on('infinite', moreEvents);
}
