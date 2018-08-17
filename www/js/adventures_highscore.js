$$(document).on('page:init', '.page[data-name="adventures"]', function (e) {
  const page = $(e.target);

  $.getJSON(API + '/adventure_mission_groups')
    .done(function(resp) {
      // Add some additional needed data
      const highscoreData = prepareAdventuresHighscore(resp);

      // Generate the template HTML and fade it in in the highscore list
      const templateHTML = app.templates.adventuresHighscoreTemplate(highscoreData);
      $(templateHTML).hide().appendTo('.adventures-highscore-list').fadeIn(300);
    })
    .fail(function(resp) {
      console.log(resp.statusText);
    });

  page.find('#adventures-highscore').on('ptr:refresh', function(e) {
    $.getJSON(API + '/adventure_mission_groups')
      .done(function(resp) {
        const highscoreData = prepareAdventuresHighscore(resp);

        // Fade out old content and remove it
        page.find('.adventures-highscore-list ul').fadeOut('300', function() {
          this.remove();
        });

        // Wait for old content to fade out
        setTimeout(function() {
          // Generate the template HTML and fade it in in the highscore list
          const templateHTML = app.templates.adventuresHighscoreTemplate(highscoreData);
          $(templateHTML).hide().appendTo('.adventures-highscore-list').fadeIn(300);

          // Return the pull to refresh loader back to its hidden place
          e.detail();
        }, 350);
      })
      .fail(function(resp) {
        console.log(resp.statusText);
      });
  });

  // Add a groups place and a special class if they're in the top three
  function prepareAdventuresHighscore(data) {
    data.groups.forEach(function(el, index) {
      el.place = index + 1;

      switch (el.place) {
        case 1:
          el.place_class = 'adventures-highscore-first';
          break;
        case 2:
          el.place_class = 'adventures-highscore-second';
          break;
        case 3:
          el.place_class = 'adventures-highscore-third';
          break;
      }
    });

    return data;
  }
});
