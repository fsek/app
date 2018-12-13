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

  let displayedYear = albums[0].years[0];

  var yearPicker = app.picker.create({
    inputEl: '#year-picker',
    cols: [
      {
        textAlign: 'center',
        values: albums[0].years,
      }
    ],
    on: {
      close: function (picker) {
        let selectedValue = parseInt(picker.value[0], 10);

        if (selectedValue !== displayedYear) { 
          displayedYear = selectedValue;

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
    if (album.thumb === null) {
      album.thumb = 'img/missing_thumb.png';
    } else {
      album.thumb = BASE_URL + album.thumb;
    }
  }

  var templateHTML = app.templates.galleryTemplate({'album': albums});
  $('.gallery-content .gallery-container').html(templateHTML);
}
