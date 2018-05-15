$$(document).on('page:init', '.page[data-name="gallery"]', function () {
  $.getJSON(API + '/gallery')
    .done(function(resp) {
      initGallery(resp.albums);
    })
    .fail(function(resp) {
      console.log(resp.statusText);
    });
});

function initGallery(albums) {
  applyTemplate(albums);

  var changedYear = false;
  var yearPicker = app.picker.create({
    inputEl: '#year-picker',
    cols: [
      {
        textAlign: 'center',
        values: albums[0].years,
      }
    ],
    on: {
      open: function() {
        changedYear = false;
      },
      change: function() {
        changedYear = true;
      },
      close: function () {
        if (changedYear) { 
          $.getJSON(API + '/gallery?year=' + yearPicker.value[0])
            .done(function(resp) {
              applyTemplate(resp.albums);
            })
            .fail(function(resp) {
              console.log(resp.statusText);
            });
        }
      }
    }
  });

}

function applyTemplate(albums) {
  for (var album of albums) {
    album.thumb = BASE_URL + album.thumb;
  }

  var templateHTML = app.templates.galleryTemplate({'album': albums});
  $('.gallery-content .gallery-container').html(templateHTML);
}
