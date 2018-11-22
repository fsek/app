// Makes the about app page a little funnier.
$$(document).on('page:init', '.page[data-name="about-app"]', function () {
  var counter = 0;
  var popup;
  var isJumping = false;

  $('.version').click(function() {
    counter++;

    if (counter === 5) {
      var templateHTML = app.templates.versionCheckTemplate({
        appLink: '',
        easter: true
      });

      popup = app.popup.create({
        content: templateHTML
      });
      popup.open();

      var smiley = $('.smiley');
      smiley.on('click', function() {
        if (!isJumping) easterJump(smiley);
      });
    }
  });
  // Makes the smiley jump.
  function easterJump(smiley) {
    isJumping = true;
    counter++;
    
    smiley.html('( •o•)');
    smiley.animate({
      bottom: '75%'
    }, 300, function() {
      smiley.animate({
        bottom: 0
      }, 300);
    });

    setTimeout(function() {
      smiley.html('( •_•)');
      isJumping = false;
      if (counter === 10) {
        popup.close();
        counter = 0;
      }
    }, 600);
  }
});


