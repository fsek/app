$$(document).on('page:init', '.page[data-name="nollning"]', function (e) {
  var tab = $(e.detail.view.$el[0]);
  var matrixPhotoBrowser = app.photoBrowser.create({
    photos: ['img/nollning_background.png'],
    swipeToClose: true,
    toolbar: false,
    iconsColor: 'white'
  });

  if ($.auth.user.nollning_moose_orange) {
    const nollningMoose = tab.find('.nollning-moose');
    if (!nollningMoose.hasClass('nollning-moose-orange')) {
      tab.find('.nollning-moose').addClass('nollning-moose-orange');
    }
  }

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

    let key = [0,1,2,3];
    if (key[keyIndex] === idNbr) {
      if (keyIndex === 3) {
        tab.find('.nollning-moose').toggleClass('nollning-moose-orange');
        $.auth.user.nollning_moose_orange = true;
        keyIndex = 0;
      } else {
        keyIndex++;
      }
    } else {
      keyIndex = 0;
    }
  });
});
