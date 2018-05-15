$$(document).on('page:init', '.page[data-name="album"]', function (e) {
  var albumId = e.detail.route.params.albumId;
  $.getJSON(API + '/albums/' + albumId)
    .done(function(resp) {
      initAlbums(resp.album);
    })
    .fail(function(resp) {
      console.log(resp.statusText);
    });
});

function initAlbums(album) {
  var imageList = [];
  for (var image of album.images) {
    image.file.thumb.url = BASE_URL + image.file.thumb.url;
    image.file.large.url = BASE_URL + image.file.large.url;
    imageList.push(image.file.large.url);
  }

  var templateHTML = app.templates.albumTemplate({
    'title': album.translations[1].title,
    'image': album.images,
    'photographers': album.photographers.length === 0 ? false : album.photographers,
    'description': album.translations[1].description
  });

  $('.album-content').html(templateHTML);

  var imageBrowser = app.photoBrowser.create({
    photos: imageList,
    swipeToClose: false,
    theme: 'dark'
  });

  $$('.album-imageBrowser').on('click', function () {
    var imageIndex = parseInt($(this)[0].dataset.index, 10);
    imageBrowser.open(imageIndex);
  });
};
