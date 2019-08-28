$$(document).on('page:beforein', '.page[data-name="event"]', function() {
  $$('.navbar').attr('id', 'orange-navbar');
  StatusBar.backgroundColorByHexString('#eb7125');
});

//Configuration of the event page
$$(document).on('page:init', '.page[data-name="event"]', function (e) {
  var eventId = e.detail.route.params.eventId;
  getData(eventId);
  $$('.event-content').on('ptr:refresh', function() {
    getData(eventId);
  });
});

function getData(eventId) {
  $.getJSON(API + '/events/' + eventId)
    .done(function(resp) {
      initEventPage(resp.event);
      app.ptr.done($$('.event-content'));
    })
    .fail(function(resp) {
      console.log(resp.statusText);
    });
}


function initEventPage(eventData) {
  generateAdditionalData(eventData);

  var eventContainer = $('.event-container');

  eventContainer.html('');

  // Apply the event page content with template
  var templateHTML = app.templates.eventPageTemplate({event: eventData});
  $(templateHTML).hide().appendTo(eventContainer).fadeIn(300);

  // Description overflow toggle if container height = maxHeight
  var descripContainer = $('.event-description-container');
  var maxHeight = descripContainer.find('.event-description').css('max-height');

  if (descripContainer.height() + 'px' == maxHeight) {
    handleDescriptionOverflow(descripContainer);
  }

  // Setup picker and buttons for signup (if it exists)
  if (eventData.can_signup) {
    setupGroupPicker(eventData);

    if (eventData.user_types != null) {
      setupUserTypePicker(eventData);
    }

    if (eventData.event_user == null) {
      setupRegistrationBtn(eventData);
    } else {
      setupCancelRegistrationBtn(eventData);
    }
  }

  function generateAdditionalData(eventData) {
    // Fix start and end date
    var dateString = generateDateString(eventData);
    eventData.date_string = dateString;

    // Need to add if event has dress code because template7 #if doesn't handle empty arrays
    var hasDressCode = eventData.dress_code.length != 0;
    eventData.hasDressCode = hasDressCode;

    if (eventData.can_signup) {
      generateSignupData(eventData);
    }
  }

  function generateDateString(eventData) {
    var startDate = new Date(eventData.starts_at);
    var endDate = new Date(eventData.ends_at);

    if (sameDay(startDate, endDate)) {
      switch (eventData.dot) {
        case 'single':
          startDate = startDate.hhmm() + ' (.)';
          break;
        case 'double':
          startDate = startDate.hhmm() + ' (..)';
          break;
        default:
          startDate = startDate.hhmm();
          break;
      }
    } else {
      // Fix the start time with dots if there is
      switch (eventData.dot) {
        case 'single':
          startDate = startDate.timeSingleDot();
          break;
        case 'double':
          startDate = startDate.timeDoubleDot();
          break;
        default:
          startDate = startDate.timeDateString();
          break;
      }
    }

    return startDate + ' - ' + endDate.timeDateString(); ;
  }

  function generateSignupData(eventData) {
    var eventSignup = eventData.event_signup;

    // Fix dates
    eventSignup.opens = new Date(eventSignup.opens);
    eventSignup.closes = new Date(eventSignup.closes);

    // Save if event signup open time has passed
    var signupOpened = !(!eventData.event_signup.open && !eventData.event_signup.closed);
    eventData.event_signup.opened = signupOpened;

    //
    if (eventData.user_types != null) {
      if (eventData.user_types.length == 0) {
        eventData.user_types = null;
      } else {
        eventData.selected_user_type = null;
      }
    }

    // Save the registered text + icon depedning if registered and if signup is closed. We also save the registered group name
    let registeredStatus, registeredStatusIcon;
    if (eventData.event_user != null) {
      if (eventData.event_signup.closed) {
        if (eventData.event_user.reserve) {
          registeredStatusIcon = 'fa-times-circle';
          registeredStatus = 'Du fick tyvärr ingen plats till eventet';
        } else {
          registeredStatusIcon = 'fa-check-circle';
          registeredStatus = 'Du är anmäld och har fått en plats till eventet!';
        }
      } else {
        registeredStatusIcon = 'fa-question-circle';
        registeredStatus = 'Du är anmäld till eventet! Kom tillbaka hit när anmälan har stängt för att se om du fått en plats';
      }

      eventData.event_user.group_name = getGroupName(eventData.groups, eventData.event_user.group_id, eventData.event_user.group_custom);
    } else {
      registeredStatusIcon = 'fa-exclamation-circle';
      registeredStatus = 'Du är inte anmäld';
    }
    eventData.registered_status_icon = registeredStatusIcon;
    eventData.registered_status = registeredStatus;

    // Save food preferences if there is food
    if (eventData.food) {
      // Add the user's food prefs to foodPreferences array
      var foodPreferences = [];
      for (foodPref of $.auth.user.food_preferences) {
        // Sometimes an empty preference comes from the website's form
        if (foodPref !== '') {
          foodPreferences.push(foodPref);
        }
      }

      // Add the custom food pref to the rest if exists
      var foodPrefCustom = $.auth.user.food_custom;
      if (foodPrefCustom !== '' && foodPrefCustom != null) {
        foodPreferences.push(foodPrefCustom.toLowerCase());
      }

      if (foodPreferences.length === 0) {
        foodPreferences.push('Inga');
      }
      eventData.food_preferences = foodPreferences;
    }

    // Save if there is any reserves and how many
    if (eventData.event_signup.closed) {
      var reserves = eventData.event_user_count - eventData.event_signup.slots;
      reserves = reserves <= 0 ? null : reserves;
      eventData.event_signup.reserves = reserves;
    }
  }

  function getGroupName(groups, groupId, groupCustom) {
    if (groupId != null) {
      var groupName = '';
      groups.forEach(function(element) {
        if (element.id == groupId) {
          groupName = element.name;
        }
      });
      return groupName;
    } else if (/\S/.test(groupCustom)) { // Check if empty or only whitespaces
      return groupCustom;
    }
    return null;

  }

  function handleDescriptionOverflow(descripContainer) {
    var descripShowing = false;
    descripContainer.append('<span><i class="fa fa-chevron-circle-down" aria-hidden="true"></i></span>');
    descripContainer.find('.event-description').addClass('content-fade');

    descripContainer.on('click', function(e) {
      var content = descripContainer.find('.event-description');

      if (!descripShowing) {
        // Calc total height of the text
        var totalHeight = 8 + 20; // first element's margin top + buffer for the icon

        content.children().each(function() {
          totalHeight += $(this).height() + 14; // 14 px margin between each element
        });

        // Expand content to the total text height
        content.css('max-height', totalHeight);
        content.css('height', totalHeight);

        descripShowing = true;
      } else {
        content.css('max-height', 100);
        descripShowing = false;
      }

      // Adjust content during animation
      setTimeout(function() {
        var icon = descripContainer.find('i');
        if (descripShowing) {
          content.removeClass('content-fade');
          icon.removeClass('fa-chevron-circle-down');
          icon.addClass('fa-chevron-circle-up');
        } else {
          content.addClass('content-fade');
          icon.removeClass('fa-chevron-circle-up');
          icon.addClass('fa-chevron-circle-down');
        }
      }, 150);
    });
  }

  function setupGroupPicker(eventData) {
    var groupNames = [];
    var groups = eventData.groups;
    if (eventData.event_user === null) {
      $('#event-signup-group').find('.item-input-wrap').html('<input type="text" placeholder="Välj din grupp" readonly id="picker-group">');
    }

    groups.forEach(function(element) {
      groupNames.push(element.name);
    });
    groupNames.push('Annan');

    var pickerGroup = app.picker.create({
      inputEl: '#picker-group',
      toolbarCloseText: 'Klar',
      cols: [
        {
          textAlign: 'center',
          values: groupNames
        }
      ],
      on: {
        close: function() {
          // Hide and show custom group input + save selected group id if not custom
          var groupCustomContainer = $('#event-signup-groupcustom');
          var value = this.cols[0].value;

          if (value === 'Annan') {
            if (groupCustomContainer.hasClass('hidden')) {
              groupCustomContainer.removeClass('hidden');
            }

            eventData.selected_group_id = null;
          } else {
            if (!groupCustomContainer.hasClass('hidden')) {
              groupCustomContainer.addClass('hidden');
            }

            groups.forEach(function(element) {
              if (element.name === value) {
                eventData.selected_group_id = element.id;
              }
            });
          }
        }
      }
    });
  }

  function setupUserTypePicker(eventData) {
    if (eventData.event_user === null) {
      $('#event-usertype').find('.item-input-wrap').html('<input type="text" placeholder="Vad är du?" readonly id="picker-usertype">');
    }

    var userTypes = [];
    eventData.user_types.forEach(function(element) {
      userTypes.push(element[0]);
    });
    userTypes.push('Övrig');

    var pickerUserType = app.picker.create({
      inputEl: '#picker-usertype',
      toolbarCloseText: 'Klar',
      cols: [
        {
          textAlign: 'center',
          values: userTypes
        }
      ],
      on: {
        close: function() {
          var value = this.cols[0].value;
          if (value !== 'Övrig') {
            eventData.user_types.forEach(function(element) {
              if (value === element[0]) {
                eventData.selected_user_type = element[1];
              }
            });
          } else {
            eventData.selected_user_type = null;
          }
        }
      }
    });
  }

  function setupCancelRegistrationBtn(eventData) {
    $('.event-signup-cancel-btn').on('click', function() {
      app.dialog.confirm('Är du säker på att du vill avanmäla dig? Det finns inget sätt att få tillbaka platsen om evenemanget blivit fullt.', 'Avanmälan', function () {
        $.ajax({
          url: API + '/events/' + eventData.id + '/event_users/' + eventData.event_user.id,
          type: 'DELETE',
          dataType: 'json',
          success: function() {
            app.dialog.alert('Du är nu avanmäld från eventet', 'Avanmälan');
            updateSignupContent(eventData);
          },
          fail: function(resp) {
            app.dialog.alert(resp.data.errors);
          }
        });
      });
    });
  }

  function setupRegistrationBtn(eventData) {
    $('.event-signup-btn').on('click', function() {
      app.dialog.confirm('Kom ihåg att anmälan är bindande! Om du inte kan komma ska du avanmäla dig innan anmälan stänger.', 'Anmälan', function() {
        // Get custom group if selected
        if (eventData.selected_group_id === null) {
          var customGroup = $('input[name="group-custom"]').val();
        }

        if (eventData.event_signup.question !== '') {
          app.dialog.prompt(eventData.event_signup.question, 'Anmälan', function (answer) {
            signupToEvent(eventData, answer, customGroup);
          });
        } else {
          signupToEvent(eventData, null, customGroup);
        }
      });
    });
  }

  function signupToEvent(eventData, answer, groupCustom) {
    $.ajax({
      url: API + '/events/' + eventData.id + '/event_users',
      type: 'POST',
      dataType: 'json',
      data: {
        event_user: {
          answer: answer,
          group_id: eventData.selected_group_id,
          group_custom: groupCustom,
          user_type: eventData.selected_user_type
        }
      },
      success: function() {
        app.dialog.alert('Du är nu anmäld till eventet', 'Anmälan');
        updateSignupContent(eventData);
      },
      fail: function(resp) {
        app.dialog.alert(resp.data.errors);
      }
    });
  }

  function updateSignupContent(eventData) {
    $.getJSON(API + '/events/' + eventData.id)
      .done(function(resp) {
        var oldEventData = eventData;
        eventData = resp.event;

        var registeredStatusContainer = $('#event-registered-status');
        var userCountContainer = $('#event-usercount');
        var questionContainer = $('#event-question-answer');
        var userTypeContainer = $('#event-usertype');
        var groupContainer = $('#event-signup-group');
        var groupCustomContainer = $('#event-signup-groupcustom');

        // Find the event index in the calendar
        let index = 0, arr = app.calendar.get().params.events;
        for (i = 0; i < arr.length; i++) {
          if (arr[i].id === eventData.id) {
            index = i;
          }
        }

        if (eventData.event_user != null) {
          // Update registered text + icon from ! to ?
          registeredStatusContainer.find('.item-title').html('Du är anmäld till eventet! Kom tillbaka hit när anmälan har stängt för att se om du fått en plats');

          var icon = registeredStatusContainer.find('.item-media i');
          icon.removeClass('fa-exclamation-circle');
          icon.addClass('fa-question-circle');

          // Update the event data of the calender with the new registration status
          app.calendar.get().params.events[index].registered_status_icon = 'fa-question-circle';
          app.calendar.get().params.events[index].registered_status = 'Du är anmäld, men inte fått en plats än';
          app.calendar.get().eventsListeners.dayClick[0](app.calendar.get(), $('.calendar-day-selected')[0]);

          // Update user count
          userCountContainer.html('Anmälda: ' + eventData.event_user_count);

          // Update question and answer if there is a question
          if (eventData.event_signup.question != '') {
            questionContainer.removeClass('hidden');
            questionContainer.find('.item-title').html(eventData.event_signup.question + ' ' + eventData.event_user.answer);
          }

          // Update user type
          if (eventData.user_types != null) {
            userTypeContainer.find('.item-input-wrap').addClass('hidden');
            userTypeContainer.find('input').remove();
            userTypeContainer.find('span').html(eventData.event_user.user_type);
            userTypeContainer.removeClass('input-showing');
          }

          /*
           * Update group
           * We remove #picker-group here and add it dynamically in setupGroupPicker() to update it with the new event data later
           */
          var group = getGroupName(eventData.groups, eventData.event_user.group_id, eventData.event_user.group_custom);
          if (group != null) {
            if (eventData.event_user.group_id === null) {
              groupCustomContainer.addClass('hidden');
            }

            groupContainer.find('span').html(group);
          } else {
            if (!groupCustomContainer.hasClass('hidden')) {
              groupCustomContainer.addClass('hidden');
            }
            groupContainer.find('span').html('Ingen grupp vald');
          }
          groupContainer.find('.item-input-wrap').addClass('hidden');
          groupContainer.find('input').remove();
          groupContainer.removeClass('input-showing');

          // Update the register button to cancel registration
          var registerBtn = $('.event-signup-btn');
          registerBtn.after('<a href="#" class="button button-big event-signup-cancel-btn">Avanmäl</a>');
          registerBtn.remove();
          setupCancelRegistrationBtn(eventData);
        } else {
          // Update registered text and icon from '?' to '!'
          registeredStatusContainer.find('.item-title').html('Du är inte anmäld');
          var icon = registeredStatusContainer.find('.item-media i');
          icon.removeClass('fa-question-circle');
          icon.addClass('fa-exclamation-circle');

          // Update the event data of the calender with the new registration status
          app.calendar.get().params.events[index].registered_status_icon = 'fa-exclamation-circle';
          app.calendar.get().params.events[index].registered_status = 'Du är inte anmäld';
          app.calendar.get().eventsListeners.dayClick[0](app.calendar.get(), $('.calendar-day-selected')[0]);

          // Update user count
          userCountContainer.html('Anmälda: ' + eventData.event_user_count);

          // Hide question if there is one
          if (eventData.event_signup.question != '') {
            questionContainer.addClass('hidden');
          }

          // Update user type
          if (eventData.user_types != null) {
            userTypeContainer.find('.item-input-wrap').removeClass('hidden');
            userTypeContainer.find('span').html('');
            userTypeContainer.addClass('input-showing');

            setupUserTypePicker(eventData);
          }

          // Update group
          var oldGroup = getGroupName(oldEventData.groups, oldEventData.event_user.group_id, oldEventData.event_user.group_custom);
          if (oldGroup != null && oldEventData.event_user.group_id === null) {
            groupCustomContainer.find('input').val('');
          }
          groupContainer.find('span').html('');
          groupContainer.find('.item-input-wrap').removeClass('hidden');
          groupContainer.addClass('input-showing');
          setupGroupPicker(eventData); // Need to setup the picker with the new event data (reinits it dynamically)

          // Update the cancel registration button to register
          var registerCancelBtn = $('.event-signup-cancel-btn');
          registerCancelBtn.after('<a href="#" class="button button-big event-signup-btn">Anmäl</a>');
          registerCancelBtn.remove();
          setupRegistrationBtn(eventData);
        }
      })
      .fail(function(resp) {
        console.log(resp.statusText);
      });
  }
}
