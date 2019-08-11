$$(document).on('page:init', '.page[data-name="nollning"]', function (e) {
  var tab = $(e.detail.view.$el[0]);

  // If we're logged in and the nollning page recives init event we need to add the group badge again
  if (!jQuery.isEmptyObject($.auth.user)) {
    setGroupNotification();
  }

  // If orange moose is has been activated we add its class
  if ($.auth.user.nollning_moose_egg) {
    const nollningMoose = tab.find('.nollning-moose');
    if (!nollningMoose.hasClass('nollning-moose-egg')) {
      nollningMoose.addClass('nollning-moose-egg');
    }
  }

  // Setup the photo browser with the matrix
  var matrixPhotoBrowser = app.photoBrowser.create({
    photos: ['img/nollning_matrix.png'],
    swipeToClose: false,
    toolbar: false,
    iconsColor: 'white'
  });

  // Open photo browser on click
  tab.find('.open-matrix-pb').on('click', function () {
    matrixPhotoBrowser.open();
  });

  // Toggle the nollning-toolbar class so the toolbar changes color in the nollning tab
  var toolbar = $('.toolbar');
  tab.on('tab:show', function() {
    if (!$('.nollning-content').hasClass('loaded')) setGroupNotification();

    if (!toolbar.hasClass('nollning-toolbar')) toolbar.addClass('nollning-toolbar');
    StatusBar.backgroundColorByHexString('#590d02');
  });

  tab.on('tab:hide', function() {
    if (toolbar.hasClass('nollning-toolbar')) toolbar.removeClass('nollning-toolbar');
    StatusBar.backgroundColorByHexString(mainBarColor);
  });

  // Orange moose
  let keyIndex = 0;
  tab.find('.nollning-stone').on('click', function() {
    const id = $(this).attr('id');
    let idNbr = -1;
    switch (id) {
      case 'nollning-f-btn':
        idNbr = 0;
        break;
      case 'nollning-pi-btn':
        idNbr = 1;
        break;
      case 'nollning-n-btn':
        idNbr = 2;
        break;
      case 'nollning-moose-btn':
        idNbr = 3;
        break;
    }

    const key = [1,2,0,3];
    if (key[keyIndex] === idNbr) {
      if (keyIndex === 3) {
        tab.find('.nollning-moose').toggleClass('nollning-moose-egg');
        $.auth.user.nollning_moose_egg = true;
        keyIndex = 0;
      } else {
        keyIndex++;
      }
    } else {
      keyIndex = 0;
    }
  });
});
