const weekColors = ['#45afeb', '#b52548', '#83213f', '#578344', '#eb7125'];
const nollningBarColor = '#c01d1d';

$$(document).on('page:init', '.page[data-name="nollning"]', function () {
  const tab = $('#view-nollning');

  // If we're logged in and the nollning page recives init event we need to add the group badge again
  if (!jQuery.isEmptyObject($.auth.user)) {
    setGroupNotification();
  }

  // If moose egg is has been activated we add its class
  if ($.auth.user.nollning_moose_egg) {
    const nollningMoose = tab.find('.nollning-moose');
    if (!nollningMoose.hasClass('nollning-moose-egg')) {
      nollningMoose.addClass('nollning-moose-egg');
    }
  }

  // Toggle the nollning-toolbar class so the toolbar changes color in the nollnings tab
  const toolbar = $('.toolbar');
  tab.on('tab:show', function(e) {
    if (!$('.nollning-content').hasClass('loaded')) setGroupNotification();

    if (!toolbar.hasClass('nollning-toolbar')) toolbar.addClass('nollning-toolbar');

    if (e.target.id === 'view-nollning') {
      StatusBar.backgroundColorByHexString(nollningBarColor);
    }
  });

  tab.on('tab:hide', function(e) {
    if (toolbar.hasClass('nollning-toolbar')) toolbar.removeClass('nollning-toolbar');

    if (e.target.id === 'view-nollning') {
      StatusBar.backgroundColorByHexString(mainBarColor);
    }
  });

  // Moose egg
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
