function loadHome() {
  if (!$$('#tab1').hasClass('loaded')) {
    $$('#tab1').addClass('loaded');
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

  var initialize = function() {
    $.getJSON(API + '/start')
    .then(function(resp) {
      addNews(resp.pinned.news.concat(resp.unpinned.news));
      totalPages = resp.unpinned.meta.total_pages;
      initEventStream(resp.events.events);
    });
  }();

  function addNews(news) {
    var templateHTML = myApp.templates.newsTemplate({news: news});
    $(templateHTML).hide().appendTo(newsList).fadeIn(1000);
  }

  function initEventStream(events) {
    var lastDay = null;

    for(var event of events) {
      event.start = new Date(event.start);

      // Add header on new days. We only download events for one week - checking date is enough
      if(lastDay != event.start.getDate()) {
        dayHTML = myApp.templates.dayTitleTemplate({date: event.start});
        eventTab.append(dayHTML);
      }

      var templateHTML = myApp.templates.dayTemplate({events: [event]});
      eventTab.append(templateHTML);
      lastDay = event.start.getDate();
    }
  }

  function detachInfinite() {
    myApp.detachInfiniteScroll(newsTab);
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
        detachInfinite();
      }
    }
  }

  newsTab.on('infinite', moreNews);
}
