$$(document).on('page:init', '.page[data-name="album"]', function (e) {
  var albumId = e.detail.route.params.albumId;
  $.getJSON(API + '/albums/' + albumId)
    .done(function(resp) {
      initAlbums(resp.album);
    })
    .fail(function(resp) {
      $$('.album-content .preloader').remove();
      if (resp.statusText === 'Unauthorized') {
        app.dialog.create({
          title: 'Fel',
          text: 'Du är inte auktoriserad för att se albumet. Detta beror på att ditt medlemskap inte är bekräftat. Frågor gällande din medlemsstatus kan skickas till spindelman@fsektionen.se.',
          closeByBackdropClick: false,
          buttons: [
            {
              text: 'Ok',
              onClick: function() {
                alternativesView.router.back();
              }
            }
          ],
        }).open();
      } else {
        $$('.album-content').append('<div class="block">Kunde inte läsa in album</div>');
      }
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
    'title': album.title,
    'image': album.images,
    'photographers': album.photographers.length === 0 ? false : album.photographers,
    'description': album.description
  });

  $('.album-content').html(templateHTML);

  var imageBrowser = app.photoBrowser.create({
    photos: imageList,
    swipeToClose: false,
    theme: 'dark',
    on: {
      open: function() {
        StatusBar.backgroundColorByHexString('#000000');
      },
      close: function() {
        StatusBar.backgroundColorByHexString(mainBarColor);
      }
    }
  });

  $$('.album-imageBrowser').on('click', function () {
    var imageIndex = parseInt($(this)[0].dataset.index, 10);
    imageBrowser.open(imageIndex);
  });
};
