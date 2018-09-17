$$(document).on('page:init', '.page[data-name="home"]', function () {
  // If signed in
  if (!jQuery.isEmptyObject($.auth.user)) {
    loadHome();
  }

  $$('#subtab-news').on('ptr:refresh', function() {
    initHome();
  });

  $$('#subtab-event').on('ptr:refresh', function() {
    initHome();
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

function initHome() {
  var fadeInTime = 600;

  var newsTab = $('#subtab-news');
  var eventList = $('#event-list');

  var newsList = newsTab.find('#news-list');

  var page = 2;
  var totalPages = 37;
  var loadingNews = false;

  var initialize = (function() {
    $.getJSON(API + '/start')
      .done(function(resp) {
        app.ptr.done($$('#subtab-news'));
        app.ptr.done($$('#subtab-event'));
        $('#news-list').html('');
        $('#event-list').html('');
        addNews(resp.pinned.news.concat(resp.unpinned.news));
        totalPages = resp.unpinned.meta.total_pages;
        initEventStream(resp.events.events);
      });
  }());

  function addNews(news) {
    var templateHTML = app.templates.newsTemplate({news: news});
    $(templateHTML).hide().appendTo(newsList).fadeIn(fadeInTime);
  }

  function initEventStream(events) {
    var lastDay = null;

    if (events.length != 0) {
      for (var event of events) {
        event.start = new Date(event.start);
        event.end = new Date(event.end);

        // Add header on new days. We only download events for one week - checking date is enough
        if (lastDay != event.start.getDate()) {
          dayHTML = app.templates.dayTitleTemplate({date: event.start});
          eventList.append(dayHTML);
        }

        var newsTemplateHTML = app.templates.dayTemplate({hasEvents: true,
          events: [event]});
        $(newsTemplateHTML).hide().appendTo(eventList).fadeIn(fadeInTime);
        lastDay = event.start.getDate();
      }
    } else {
      var eventTemplateHTML = app.templates.dayTemplate({hasEvents: false});
      $(eventTemplateHTML).hide().appendTo(eventList).fadeIn(fadeInTime);
    }
  }

  function destroyInfinite() {
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
        destroyInfinite();
      }
    }
  }

  newsTab.on('infinite', moreNews);
}
