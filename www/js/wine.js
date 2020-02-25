$$(document).on('page:init', '.page[data-name="wine"]', function() {
  $.getJSON(API + '/wines')
    .done(function(resp) {
      initWines(resp.wines);
    })
    .fail(function(resp) {
      console.log(resp);
    })

  function initWines(wines) {
    let templateHTML = app.templates.wineTemplate({wine: wines});
    $('.wine-content').html(templateHTML);
  }
})
