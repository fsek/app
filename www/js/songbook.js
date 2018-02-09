myApp.onPageInit('songbook', function (page) {
  $.getJSON(API + '/songs')
  .done(function(resp) {
    initSongList(resp.songs);
  })
  .fail(function(resp){
    console.log(resp.statusText);
  });
});

//Creates a list of JSON objects containing list and the first letter of the songs
function initSongList(songdata) {
  var currentLetter = songdata[0].title.charAt(0);
  var songList = [];
  songList.push({firstLetter: currentLetter, songs:[]});
  var counter = 0;
  songdata.forEach(function(element) {
    if (element.title.charAt(0) == currentLetter) {
      songList[counter].songs.push(element);
    } else {
      currentLetter = element.title.charAt(0);
      counter++;
      songList.push({firstLetter: currentLetter, songs:[] });
      songList[counter].songs.push(element);
    }
  })
  var templateHTML = myApp.templates.songbookTemplate({letter: songList});
  var songbookContent = $('.songbook-content');
  songbookContent.html(templateHTML);
  //Get height of songbook-content and set overlay height accordingly
  $('.searchbar-overlay').height(songbookContent.height());
}

myApp.onPageInit('song', function (page) {
  $.getJSON(API + '/songs/' + page.query.id)
  .done(function(resp) {
    var templateHTML = myApp.templates.songTemplate({song:resp});
    var songContent = $('.song-content');
    songContent.html(templateHTML);
  })
  .fail(function(resp){
    console.log(resp.statusText);
  });
});
