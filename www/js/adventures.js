$$(document).on('page:init', '.page[data-name="adventures"]', function(e) {
  const page = $(e.target);
  const progressColors = ['#ea545a', '#ff9368', '#ea6767', '#eb7125', '#ffbc8b'];

  $.getJSON(API + '/adventures')
    .done(function(resp) {
      initAdventureGroup(resp);
      initCurrentAdventureList(resp);
      page.find('.adventures-current-preloader').remove();
    })
    .fail(function(resp) {
      console.log(resp.statusText);

      page.find('.adventure-missions-btn').remove();
      page
        .find('#adventures-current')
        .html('<div class="adventures-current-empty"> Inga äventyrsuppdrag är tillgängliga :(</div>');
      page.find('.adventure-week-stats-title').html('Ingen faddergrupp är tillgänglig :(');
      page.find('.adventures-current-preloader').remove();
    });

  $.getJSON(API + '/adventure_mission_groups')
    .done(function(resp) {
      initAdventureHighscore(resp);
    })
    .fail(function(resp) {
      console.log(resp.statusText);
    });

  function initCurrentAdventureList(resp) {
    // Save the response and the is_mentor value (current week's adventure is the last one in the array)
    const currentIndex = resp.adventures.adventures.length - 1;
    let adventureData = resp.adventures.adventures[currentIndex];
    adventureData.is_mentor = resp.is_mentor;

    // Add totalt mission count and total completed mission count to the adventureData object
    adventureData.mission_count = adventureData.adventure_missions.length;

    // Generate the templateHTML for the header and the missions. Then remove the preloader and fade in the templateHTML in the containers
    const templateHeaderHTML = app.templates.currentAdventureMissionsHeaderTemplate(adventureData);
    const templateMissionsHTML = app.templates.currentAdventureMissionsTemplate(adventureData);

    $(templateHeaderHTML)
      .hide()
      .appendTo('.adventures-current-header')
      .fadeIn(300);
    $(templateMissionsHTML)
      .hide()
      .appendTo('.adventures-current-list')
      .fadeIn(300);

    // Move down the list below the header
    const headerHeight = page.find('.adventures-current-header')[0].clientHeight - 6;
    page.find('.adventures-current-list').css('margin-top', headerHeight);

    // Save the progressbar "globally" and set the progress in updateAdventureMissionsHeader(true) (true is for firstInit)
    const progressbar = page.find('.adventures-current-progressbar');
    updateAdventureMissionsHeader(true);

    // Setup the swipeout actions that show the 'Slutför' and 'Återställ' buttons
    setupSwipeouts();

    // Reload the adventures when pull down refresh event is triggered
    page.find('#adventures-current').on('ptr:refresh', function(e) {
      $.getJSON(API + '/adventures')
        .done(function(resp) {
          if (page.find('#adventures-current').hasClass('tab-active')) {
            app.ptr.refresh('#adventure-group');
            app.ptr.refresh('#adventures-highscore');
          }
          // Save the response "globally" and save the is_mentor value (current week's adventure is the last one in the array)
          const currentIndex = resp.adventures.adventures.length - 1;
          adventureData = resp.adventures.adventures[currentIndex];
          adventureData.is_mentor = resp.is_mentor;

          refreshAdventureMissions(e);
        })
        .fail(function(resp) {
          console.log(resp.statusText);
        });
    });

    function refreshAdventureMissions(event) {
      // Update the totalt mission count and total completed mission count on the adventureData object
      adventureData.mission_count = adventureData.adventure_missions.length;

      // Fade out old content
      page.find('.adventures-current-list').html('');

      // Generate html for the updated missions and fade in its container
      const updatedTemplateHTML = app.templates.currentAdventureMissionsTemplate(adventureData);
      $(updatedTemplateHTML)
        .hide()
        .appendTo('.adventures-current-list')
        .fadeIn(300);

      updateAdventureMissionsHeader(false);
      setupSwipeouts();

      // Return the pull to refresh loader back to its hidden place
      event.detail();
    }

    function updateAdventureMissionsHeader(firstInit) {
      // Calculate the progress and set it on the progressbar
      const completedMissionCount = adventureData.missions_finished;
      const missionCount = adventureData.mission_count;
      const progress = completedMissionCount * 100 / missionCount;

      app.progressbar.set(progressbar, progress, 800);

      // On first load the text is updated and gets set in the template, so we don't need to update it here
      if (!firstInit) {
        page
          .find('.adventures-current-title')
          .html(
            adventureData.title +
              ' (v.' +
              adventureData.week_number +
              ')' +
              '<span>' +
              completedMissionCount +
              ' av ' +
              missionCount +
              '</span>'
          );
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
            app.dialog.prompt('Skriv in antalet tjänade poäng <br> (max: ' + maxPoints + ' p)', 'Poäng', function(
              points
            ) {
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
          app.ptr.refresh('#adventures-highscore');
          app.ptr.refresh('#adventure-group');
          swipeout.addClass('adventure-mission-completed');
          adventureData.missions_finished++;
          updateAdventureMissionsHeader(false);
        },
        error: function(resp) {
          app.dialog.alert(resp.responseJSON.error, 'Ouch!');
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
          app.ptr.refresh('#adventures-highscore');
          app.ptr.refresh('#adventure-group');
          swipeout.removeClass('adventure-mission-completed');
          adventureData.missions_finished--;
          updateAdventureMissionsHeader(false);
        },
        error: function(resp) {
          app.dialog.alert(resp.responseJSON.error, 'Ouch!');
        }
      });
    }
  }

  function initAdventureGroup(adventuresData) {
    let animateWeekProgress = true;
    adventuresData.max_total_points = getAdventuresMaxPoints(adventuresData);

    let progress = Math.round(adventuresData.total_group_points * 100 / adventuresData.max_total_points);
    adventuresData.points_percent = progress;

    var templateHTML = app.templates.adventureGroupHeaderTemplate(adventuresData);
    $('#adventure-group .ptr-preloader').after(templateHTML);

    const progressbar = page.find('.adventure-group-progressbar');
    const weekProgressbars = setupWeekProgressbars();

    page.find('#adventure-group').on('tab:show', function() {
      if (animateWeekProgress) {
        // Wait a bit for the tab transition animation to finish
        setTimeout(function() {
          weekProgressbars.forEach(function(el) {
            el.animate(el.progress);
          });
          app.progressbar.set(progressbar, progress, 500);
          animateWeekProgress = false;
        }, 200);
      }
    });

    page.find('.adventure-missions-btn').on('click', function() {
      // Load adventure_missions.html with the data. Since we already have the data we can load it with componentUrl and put the template in the html file
      nollningView.router.navigate('adventure_missions/', {
        context: adventuresData
      });
    });

    page.find('#adventure-group').on('ptr:refresh', function(e) {
      $.getJSON(API + '/adventures')
        .done(function(resp) {
          adventuresData = resp;
          const maxTotalPoints = getAdventuresMaxPoints(adventuresData);
          const isTabActive = page.find('#adventure-group').hasClass('tab-active');
          adventuresData.adventures.adventures.forEach(function(el, index) {
            weekProgressbar = weekProgressbars[index];
            weekProgressbars[index].setText(
              el.title + ': <br>' + el.missions_finished + ' / ' + el.adventure_missions.length
            );

            const weekProgress = el.missions_finished / el.adventure_missions.length;
            // Only animate the weekly progressbars if the group tab is active otherwise we wait for it to be shown and then animate in the tab:show event above
            if (isTabActive) {
              weekProgressbar.set(0);
              weekProgressbar.animate(weekProgress);
            } else {
              weekProgressbar.progress = weekProgress;
              animateWeekProgress = true;
            }
          });
          page
            .find('.adventure-group-points-title span')
            .html(adventuresData.total_group_points + ' / ' + maxTotalPoints);

          progress = Math.round(adventuresData.total_group_points * 100 / maxTotalPoints);
          page.find('.adventure-group-progress').html(progress + '%');

          if (isTabActive) {
            app.progressbar.set(progressbar, 0, 0);

            // Wait a bit for the refresh animation to finish before setting progress
            setTimeout(function() {
              app.progressbar.set(progressbar, progress, 500);
            }, 300);

            app.ptr.refresh('#adventures-current');
            app.ptr.refresh('#adventures-highscore');
          } else {
            animateWeekProgress = true;
          }

          // Return the pull to refresh loader back to its hidden place
          e.detail();
        })
        .fail(function(resp) {
          console.log(resp.statusText);
        });
    });

    function getAdventuresMaxPoints(adventureData) {
      let maxTotalPoints = 0;
      adventureData.adventures.adventures.forEach(function(adventure) {
        adventure.adventure_missions.forEach(function(adventureMission) {
          maxTotalPoints += adventureMission.max_points;
        });
      });

      return maxTotalPoints;
    }

    function setupWeekProgressbars() {
      let allWeekProgressbars = [];
      const swiperContainer = $('.adventure-week-stats-swiper');
      const nollningWeek = adventuresData.adventures.adventures.length - 1;

      adventuresData.adventures.adventures.forEach(function(el, index) {
        swiperContainer.find('.swiper-wrapper').append('<div class="adventure-week-stats swiper-slide"></div>');

        const weekProgressbarContainers = page.find('.adventure-week-stats');
        const missionsFinished = el.missions_finished;
        const missionsCount = el.adventure_missions.length;

        const weekProgressbar = new ProgressBar.Circle(weekProgressbarContainers[index], {
          color: progressColors[nollningWeek],
          strokeWidth: 5,
          trailWidth: 2,
          trailColor: '#000',
          fill: 'rgba(0, 0, 0, 0.5)',
          duration: 1000,
          easing: 'easeInOut',
          text: {
            value: el.title + ': <br>' + missionsFinished + ' / ' + missionsCount,
            style: {
              color: '#fff',
              position: 'absolute',
              left: '50%',
              top: '50%',
              padding: 0,
              margin: 0,
              transform: {
                prefix: true,
                value: 'translate(-50%, -50%)'
              }
            }
          },
          from: {
            width: 1
          },
          to: {
            width: 5
          },
          step: function(state, shape) {
            shape.path.setAttribute('stroke-width', state.width);

            const value = Math.round(shape.value() * missionsCount);
            shape.setText(el.title + ': <br>' + value + ' / ' + missionsCount);
          }
        });

        const weekProgress = missionsFinished / missionsCount;
        weekProgressbar.progress = weekProgress;
        allWeekProgressbars.push(weekProgressbar);
      });

      const swiperWidth = $('body')[0].clientWidth - 30;
      const swiper = app.swiper.create(swiperContainer, {
        initialSlide: nollningWeek,
        centerSildes: true,
        width: swiperWidth,
        spaceBetween: 15,
        roundLengths: true,
        slidesPerView: 2,
        slidesPreGroup: 2,
        pagination: {
          el: '.swiper-pagination',
          type: 'bullets'
        }
      });

      return allWeekProgressbars;
    }
  }

  function initAdventureHighscore(resp) {
    // Add some additional needed data
    const highscoreData = prepareAdventuresHighscore(resp);

    // Generate the template HTML and fade it in in the highscore list
    const templateHTML = app.templates.adventuresHighscoreTemplate(highscoreData);
    $(templateHTML)
      .hide()
      .appendTo('.adventures-highscore-list')
      .fadeIn(300);

    page.find('#adventures-highscore').on('ptr:refresh', function(e) {
      $.getJSON(API + '/adventure_mission_groups')
        .done(function(resp) {
          const highscoreDataPtr = prepareAdventuresHighscore(resp);

          if (page.find('#adventures-highscore').hasClass('tab-active')) {
            app.ptr.refresh('#adventures-current');
            app.ptr.refresh('#adventure-group');
          }

          // Fade out old content and remove it
          page.find('.adventures-highscore-list').html('');

          // Generate the template HTML and fade it in in the highscore list
          const templateHTML = app.templates.adventuresHighscoreTemplate(highscoreDataPtr);
          $(templateHTML)
            .hide()
            .appendTo('.adventures-highscore-list')
            .fadeIn(600);

          // Return the pull to refresh loader back to its hidden place
          e.detail();
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
  }
});
