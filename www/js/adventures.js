$$(document).on('page:init', '.page[data-name="adventures"]', function (e) {
  const page = $(e.target);
  let adventureData, progressbar;

  $.getJSON(API + '/adventures')
    .done(function(resp) {
      // Save the response "globally" and save the is_mentor value (current week's adventure is the last one in the array)
      const currentIndex = resp.adventures.adventures.length - 1;
      adventureData = resp.adventures.adventures[currentIndex];
      adventureData.is_mentor = resp.is_mentor;

      initCurrentAdventureList();
    })
    .fail(function(resp) {
      console.log(resp.statusText);
    });

  function initCurrentAdventureList() {
    // Add totalt mission count and total completed mission count to the adventureData object
    adventureData.mission_count = adventureData.adventure_missions.length;

    // Generate the templateHTML for the header and the missions. Then remove the preloader and fade in the templateHTML in the containers
    const templateHeaderHTML = app.templates.adventureMissionsHeaderTemplate(adventureData);
    const templateMissionsHTML = app.templates.currentAdventureMissionsTemplate(adventureData);

    page.find('.adventure-current-preloader').remove();
    $(templateHeaderHTML).hide().appendTo('.adventure-current-header').fadeIn(300);
    $(templateMissionsHTML).hide().appendTo('.adventure-current-list').fadeIn(300);

    // Save the progressbar "globally" and set the progress in updateAdventureMissionsHeader(true) (true is for firstInit)
    progressbar = page.find('.adventure-current-progressbar');
    updateAdventureMissionsHeader(true);

    // Setup the swipeout actions that show the 'Slutför' and 'Återställ' buttons
    setupSwipeouts();

    // Reload the adventures when pull down refresh event is triggered
    page.find('#adventure-current').on('ptr:refresh', function() {
      $.getJSON(API + '/adventures')
        .done(function(resp) {
          // Save the response "globally" and save the is_mentor value (current week's adventure is the last one in the array)
          const currentIndex = resp.adventures.adventures.length - 1;
          adventureData = resp.adventures.adventures[currentIndex];
          adventureData.is_mentor = resp.is_mentor;

          refreshAdventureMissions();
        })
        .fail(function(resp) {
          console.log(resp.statusText);
        });
    });
  }

  function refreshAdventureMissions() {
    // Update the totalt mission count and total completed mission count on the adventureData object
    adventureData.mission_count = adventureData.adventure_missions.length;

    // Fade out old content
    page.find('.adventure-current-list ul').fadeOut('300', function() {
      this.remove();
    });

    // Wait for fade out animation
    setTimeout(function() {
      // Generate html for the updated missions and fade in its container
      const updatedTemplateHTML = app.templates.currentAdventureMissionsTemplate(adventureData);
      $(updatedTemplateHTML).hide().appendTo('.adventure-current-list').fadeIn(300);

      updateAdventureMissionsHeader(false);
      setupSwipeouts();

      // Return the pull to refresh loader back to its hidden place
      app.ptr.done();
    }, 300);
  }

  function updateAdventureMissionsHeader(firstInit) {
    // Calculate the progress and set it on the progressbar
    const completedMissionCount = adventureData.missions_finished;
    const missionCount = adventureData.mission_count;
    const progress = completedMissionCount*100/missionCount;

    app.progressbar.set(progressbar, progress, 800);

    // On first load the text is updated and gets set in the template, so we don't need to update it here
    if (!firstInit) {
      page.find('.adventure-current-title').html('Vecka ' + adventureData.week_number + ' - ' + adventureData.title +
                                                  '<span>' + completedMissionCount + ' av ' + missionCount + '</span>');
    }
  }

  function setupSwipeouts() {
    // Event when the green swipeout button 'Slutför' is clicked
    page.find('.complete-adventure-mission').on('click', function() {
      // Find the open swipeout which is the mission the user has interacted with
      const swipeout = page.find('.swipeout-opened');

      // If it's not already completed
      if (!swipeout.hasClass('adventure-mission-completed')) {
        const adventureMissionData = swipeout[0].dataset;
        const maxPoints = parseInt(adventureMissionData.maxPoints, 10);

        // If it the mission can have different points we show a prompt for an user input, otherwise we go straight to the post request
        if (adventureMissionData.variablePoints === 'true') {
          app.dialog.prompt('Skriv in antalet tjänade poäng <br> (max: ' + maxPoints + ' p)', 'Poäng', function (points) {
            // The points input need to have a value and be less than the max. If it is we got to the post request, otherwise we alert an error
            points = parseInt(points, 10);
            if (points !== '' && points <= maxPoints && points !== 0) {
              finishAdventureMission(adventureMissionData.id, points, swipeout);
            } else {
              app.dialog.alert('Ogiltigt antal poäng. Var god och försök igen älskling <3', 'Fel');
            }
          });
        } else {
          finishAdventureMission(adventureMissionData.id, maxPoints, swipeout);
        }
      }

      // Close the open swipeout
      app.swipeout.close(swipeout);
    });

    // Event when the orange swipeout button 'Återställ' is clicked
    page.find('.reset-adventure-mission').on('click', function() {
      // Find the open swipeout which is the mission the user has interacted with
      const swipeout = page.find('.swipeout-opened');

      // If it's completed we remove the completed class, decrement the completed mission count and updated the header
      if (swipeout.hasClass('adventure-mission-completed')) {
        const adventureMissionId = swipeout[0].dataset.id;
        resetAdventureMission(adventureMissionId, swipeout);
      }

      // Close the open swipeout
      app.swipeout.close(swipeout);
    });
  }

  /*
   * Make a post request to mark a mission as finished and with what points it was finished with.
   * On success we increment the completed mission count, update the progressbar and make the listitem green
   */
  function finishAdventureMission(id, points, swipeout) {
    $.ajax({
      url: API + '/adventure_missions/finish_adventure_mission',
      type: 'POST',
      dataType: 'json',
      data: {
        adventure_mission_id: id,
        points: points
      },
      success: function() {
        swipeout.addClass('adventure-mission-completed');
        adventureData.missions_finished++;
        updateAdventureMissionsHeader(false);
      },
      fail: function(resp) {
        app.dialog.alert(resp.data.errors);
      }
    });
  }

  // Make delete request for the selected mission. If successful we remove the completed class, decrement the finished missions counter and refresh the header
  function resetAdventureMission(id, swipeout) {
    $.ajax({
      url: API + '/adventure_missions/reset_adventure_mission',
      type: 'DELETE',
      dataType: 'json',
      data: {
        adventure_mission_id: id
      },
      success: function() {
        swipeout.removeClass('adventure-mission-completed');
        adventureData.missions_finished--;
        updateAdventureMissionsHeader(false);
      },
      fail: function(resp) {
        app.dialog.alert(resp.data.errors);
      }
    });
  }
});
