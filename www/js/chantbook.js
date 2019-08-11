$$(document).on('page:init', '.page[data-name="chantbook"]', function (e) {
  $.getJSON(API + '/songs/chants')
    .done(function(resp) {
      initChantList(resp.songs);
    })
    .fail(function(resp) {
      console.log(resp.statusText);
    });
});

//Creates a list of JSON objects containing list and author of the songs
function initChantList(songdata) {
  var currentAuthor = songdata[0].author;
  var chantList = [];

  chantList.push({
    thisAuthor: currentAuthor,
    songs: []
  });
  var counter = 0;
  songdata.forEach(function(element) {
    if (element.author === currentAuthor) {
      chantList[counter].songs.push(element);
    } else {
      currentAuthor = element.author;
      counter++;
      chantList.push({thisAuthor: currentAuthor,
        songs: []});
      chantList[counter].songs.push(element);
    }
  });

  var templateHTML = app.templates.chantbookTemplate({author: chantList});
  var chantbookList = $('#chantbook-list');
  chantbookList.html(templateHTML);
}
