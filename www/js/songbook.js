$$(document).on('page:init', '.page[data-name="songbook"]', function (e) {
  $.getJSON(API + '/songs')
    .done(function(resp) {
      initSongList(resp.songs);
    })
    .fail(function(resp) {
      console.log(resp.statusText);
    });
});

//Creates a list of JSON objects containing list and the first letter of the songs
function initSongList(songdata) {
  var currentLetter = songdata[0].title.charAt(0);
  var songList = [];

  songList.push({
    firstLetter: currentLetter,
    songs: []
  });
  var counter = 0;
  songdata.forEach(function(element) {
    if (element.title.charAt(0) == currentLetter) {
      songList[counter].songs.push(element);
    } else {
      currentLetter = element.title.charAt(0);
      counter++;
      songList.push({firstLetter: currentLetter,
        songs: []});
      songList[counter].songs.push(element);
    }
  });
  console.log(songList);
  var templateHTML = app.templates.songbookTemplate({letter: songList});
  var songbookList = $('#songbook-list');
  songbookList.html(templateHTML);

  // Create the indexed list after we've applied the songs to set it up with them
  var listIndex = app.listIndex.create({
    el: '.list-index',
    listEl: '#songbook-list',
    label: true,
  });
}

$$(document).on('page:init', '.page[data-name="song"]', function (e) {
  var songId = e.detail.route.params.songId;
  $.getJSON(API + '/songs/' + songId)
    .done(function(resp) {
      var templateHTML = app.templates.songTemplate({song: resp});
      var songContent = $('.song-content');
      songContent.html(templateHTML);
    })
    .fail(function(resp) {
      console.log(resp.statusText);
    });
});
