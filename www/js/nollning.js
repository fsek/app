$$(document).on('page:init', '.page[data-name="nollning"]', function (e) {
  var tab = $(e.detail.view.$el[0]);
  var matrixPhotoBrowser = app.photoBrowser.create({
    photos: ['img/nollning_background.png'],
    swipeToClose: true,
    toolbar: false,
    iconsColor: 'white'
  });

  //Open photo browser on click
  tab.find('.open-matrix-pb').on('click', function () {
    matrixPhotoBrowser.open();
  });

  // Toggle the nollning-toolbar class so the toolbar changes color in the nollnings tab
  var toolbar = $('.toolbar');
  tab.on('tab:show', function() {
    if (!toolbar.hasClass('nollning-toolbar')) toolbar.addClass('nollning-toolbar');
  });

  tab.on('tab:hide', function() {
    if (toolbar.hasClass('nollning-toolbar')) toolbar.removeClass('nollning-toolbar');
  });
});
