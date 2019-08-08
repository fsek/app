$$(document).on('page:beforeout', '.page[data-name="nollning"]', function (e) {
  const navbar = $('#view-nollning .navbar');
  if (navbar.hasClass('nollning-navbar')) {
    navbar.removeClass('nollning-navbar');
  }
});

$$(document).on('page:afterin', '.page[data-name="nollning"]', function (e) {
  const navbar = $('#view-nollning .navbar');
  if (!navbar.hasClass('nollning-navbar')) {
    navbar.addClass('nollning-navbar');
  }
});

$$(document).on('page:init', '.page[data-name="nollning"]', function (e) {
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

  // Append the correct weekly styling (nollning start on week 35)
  const nollningWeek = new Date().getWeekNumber() - 34;
  $('#view-nollning').addClass(`adventure-week-${nollningWeek}`);

  // Toggle the nollning-toolbar class so the toolbar changes color in the nollnings tab
  const toolbar = $('.toolbar');
  tab.on('tab:show', function(e) {
    if (!$('.nollning-content').hasClass('loaded')) setGroupNotification();

    if (!toolbar.hasClass('nollning-toolbar')) toolbar.addClass('nollning-toolbar');
    StatusBar.backgroundColorByHexString('#590d02');

    if (e.target.id === 'view-nollning') {
      const navbar = $('#view-nollning .navbar');
      if (!navbar.hasClass('nollning-navbar')) {
        navbar.addClass('nollning-navbar');
      }
    }
  });

  tab.on('tab:hide', function() {
    if (toolbar.hasClass('nollning-toolbar')) toolbar.removeClass('nollning-toolbar');
    StatusBar.backgroundColorByHexString(mainBarColor);
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
