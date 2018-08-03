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
  var newsTab = $('#subtab1');
  var eventTab = $('#subtab2');

  var newsList = newsTab.find('#news-list');

  var page = 2;
  var totalPages = 37;
  var loadingNews = false;

  var initialize = (function() {
    $.getJSON(API + '/start')
      .then(function(resp) {
        addNews(resp.pinned.news.concat(resp.unpinned.news));
        totalPages = resp.unpinned.meta.total_pages;
        initEventStream(resp.events.events);
      });
  }());

  function addNews(news) {
    var templateHTML = app.templates.newsTemplate({news: news});
    $(templateHTML).hide().appendTo(newsList).fadeIn(1000);
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
          eventTab.append(dayHTML);
        }

        var templateHTML = app.templates.dayTemplate({hasEvents: true,
          events: [event]});
        eventTab.append(templateHTML);
        lastDay = event.start.getDate();
      }
    } else {
      var templateHTML = app.templates.dayTemplate({hasEvents: false});
      eventTab.append(templateHTML);
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
