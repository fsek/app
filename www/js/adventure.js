$$(document).on('page:init', '.page[data-name="adventure"]', function () {
  $.getJSON(API + '/adventures')
    .done(function(resp) {
      var templateHTML = app.templates.adventureListTemplate(resp);
      $('.adventure-container #asd1').html(templateHTML);
    })
    .fail(function(resp) {
      console.log(resp.statusText);
    });
});
