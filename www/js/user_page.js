var foodCustom, formChanged, popupOpen, programPicker, startYearPicker, updateUser, user;

$$(document).on('page:init', '.page[data-name="user-page"]', function () {
  user = $.auth.user;
  formChanged = false;
  foodCustom = user.food_custom;
  initUserPage(user);
});

function userBackButton() {
  if (typeof app.dialog.get() === 'undefined') {
    // Custom food must be checked separately since it is not part of the form
    if (formChanged || user.food_custom !== foodCustom) {
      app.dialog.create({
        title: 'Osparade ändringar',
        text: 'Du verkar ha osparade ändringar! Vad vill du göra med dem?',
        closeByBackdropClick: true,
        buttons: [
          {
            text: 'Släng',
            onClick: function() {
              alternativesView.router.back();
            }
          },
          {
            text: 'Spara',
            onClick: function() {
              updateUser(user).then(function() {
                alternativesView.router.back();
              });
            },
          },
        ]
      }).open();
    } else {
      alternativesView.router.back();
    }
  } else {
    app.dialog.close();
  }
}

function initUserPage() {
  // Fill the page with data that is not in the form like name and profile picture
  fillPageWithNonFormData(user);

  // Generate JSON data for the form out of the user object and add it to the form
  var formData = {
    'firstname': user.firstname,
    'lastname': user.lastname,
    'program': user.program,
    'start_year': user.start_year,
    'student_id': user.student_id,
    'phone': user.phone,
    'display_phone': user.display_phone ? 'on' : 'off',
    'notify_event_users': user.notify_event_users ? 'on' : 'off',
    'notify_messages': user.notify_messages ? 'on' : 'off',
    'notify_event_closing': user.notify_event_closing ? 'on' : 'off',
    'notify_event_open': user.notify_event_open ? 'on' : 'off',
  };
  app.form.fillFromData('#user-form', formData);

  // Setup program picker
  initProgramPicker(user.program);

  // Setup start year picker
  initStartYearPicker(user.start_year);

  // Setup smart select
  initSmartSelect();

  $('.user-update').on('click', function() {
    updateUser(user);
  });

  $('.back-button').on('click', function() {
    userBackButton();
  });

  $('#user-form').change(function() {
    formChanged = true;
  });

  function fillPageWithNonFormData() {
    var userContent = $('.user-content');

    // Add first and last name to the user container text
    userContent.find('.user-container p').html(user.firstname + ' ' + user.lastname);

    // Set correct avatar URL (adds the base url) and add it as background image on the user-avatar
    var avatarURL = '';
    if (user.avatar.thumb.url != null) {
      avatarURL = BASE_URL + user.avatar.thumb.url;
      userContent.find('.user-avatar').css('background-image', 'url(' + avatarURL + ')');
    }


    // Adds 'inga' to the item-after object if there is no food preferences
    if (user.food_preferences.length == 0 && user.food_custom == '') {
      userContent.find('.user-food-pref .item-after').html('Inga');
    }

    // Add member date to the page while setting it to the fullDate type
    var memberDate = new Date(user.member_at).fullDate();
    userContent.find('#user-member-at').html('Medlemskap sedan ' + memberDate);
  }

  function initProgramPicker(selectedProgram) {
    programPicker = app.picker.create({
      inputEl: '#user-program-input',
      rotateEffect: true,
      toolbarCloseText: 'Klar',
      cols: [
        {
          textAlign: 'center',
          values: ['Teknisk Fysik', 'Teknisk Matematik', 'Teknisk Nanovetenskap', 'Oklart'],
        }
      ]
    });
    programPicker.setValue([selectedProgram]);
  }

  function initStartYearPicker(selectedYear) {
    // Create array with start year alternatives (all years from 1961)
    var startYears = [];
    var thisYear = new Date().getFullYear();
    for (var i = 0; i <= thisYear - 1961; i++) {
      startYears[i] = thisYear - i;
    }

    startYearPicker = app.picker.create({
      inputEl: '#user-startyear-input',
      rotateEffect: true,
      toolbarCloseText: 'Klar',
      cols: [
        {
          textAlign: 'center',
          values: startYears,
        }
      ]
    });

    startYearPicker.setValue([selectedYear]);
  }

  function initSmartSelect() {
    // Add 'selected' attribute to the food preference options that match the users
    selectFoodPreferences();

    // Init smart select with the selected options
    var smartSelect = app.smartSelect.create({
      el: '#foodpref-select',
      openIn: 'page',
      pageBackLinkText: 'Tillbaka',
      on: {
        open: function(smartSelect) {
          var page = smartSelect.$containerEl;
          var otherInputHTML = `<li id="option-other">
                                  <div class="item-content">
                                    <div class="item-inner">
                                      <div class="item-input">
                                        <input name="other" type="text" placeholder="Andra matpreferenser/allergier">
                                      </div>
                                    </div>
                                  </div>
                                </li>`;

          var optionValue = foodCustom;
          var optionOther = smartSelect.items[5];
          var isOtherSelected = optionOther.selected;

          // Adds the input html if the 'Annat' option is selected (has the 'selected' attribute)
          if (isOtherSelected) {
            page.find('ul').append(otherInputHTML);
            $('#option-other input').val(optionValue);
          }

          // On click event for the 'other' food preference alternative which adds/removes the input html dynamically while saving the input value
          var otherListItem = page.find('li')[5];
          $(otherListItem).on('click', function(e) {
            if (isOtherSelected) {
              optionValue = $('#option-other input')[0].value;
              page.find('#option-other').remove();
            } else {
              page.find('ul').append(otherInputHTML);
              $('#option-other input')[0].value = optionValue;
            }

            isOtherSelected = !isOtherSelected;
          });
        },
        close: function(smartSelect) {
          app.toolbar.show();
          // Update selected options to 'Inga' if nothing was selected
          var selectedOptions = $('.user-food-pref .item-after');
          if (selectedOptions.html() == '') {
            selectedOptions.html('Inga');
          }

          // Updates user.food_custom to either the input value (if the 'Annat' input was found) otherwise an empty string
          var otherInput = $('#option-other input');

          // Check if text field 'Annat' is not empty and not just whitespace
          if (otherInput.length !== 0 && (/\S/).test(otherInput[0].value)) {
            foodCustom = otherInput[0].value;
          } else {
            foodCustom = '';
          }
        }
      }
    });
  }

  function selectFoodPreferences() {
    var options = $('.user-content option');
    var foodPreferences = $.auth.user.food_preferences;

    // Get rid of an empty element in the array that somtimes comes from the form on the website'
    var emptyIndex = foodPreferences.indexOf('');
    if (emptyIndex > -1) {
      foodPreferences.splice(emptyIndex, 1);
    }

    if (foodPreferences.length !== 0) {
      // Changes 'milk' to 'mjölkallergi' to match the options
      var milkIndex = foodPreferences.indexOf('milk');
      if (milkIndex > -1) {
        foodPreferences[milkIndex] = 'mjölkallergi';
      }

      /*
       * Add 'selected' attribute to the options that match the user.food_preferences elements
       * 'length - 1' because we don't need to check for the last option 'annat'
       */
      for (var i = 0; i < options.length - 1; i++) {
        foodPreferences.forEach(function(element) {
          if (options[i].innerHTML.toLowerCase() == element) {
            options[i].setAttribute('selected', '');
          }
        });
      }
    }

    // Add 'selected' attribute to the 'Annat' option if food_custom exists
    if ($.auth.user.food_custom != '') {
      options[options.length-1].setAttribute('selected', '');
    }
  }

  updateUser = function() {
    return new Promise((resolve) => {
      // Open preloader that closes after 0.8s and updates the name text
      app.dialog.preloader('Sparar inställningar');
      var hidePreloader = false;
      setTimeout(function() {
        // don't update if error callback on the ajax request
        if (hidePreloader) {
          app.dialog.close();
          $('.user-container p').html(user.firstname + ' ' + user.lastname);
        } else {
          hidePreloader = true;
        }
      }, 800);

      // Get data from the form
      formData = app.form.convertToData('#user-form');

      // Edit and update formData
      formData = prepareFormData(formData, user);

      // Sen and ajax PUT request to update the user setting with formData
      $.ajax({
        type: 'PUT',
        dataType: 'json',
        url: API + '/users/' + user.id,
        data: {user: formData}
      })
        .done(function() {
          if (hidePreloader) {
            app.dialog.close();
          } else {
            hidePreloader = true;
            formChanged = false;
          }
          setTimeout(() => resolve('Finished!'), 800);
        })
        .fail(function() {
          app.dialog.close();
          app.dialog.alert('Kunde inte uppdatera dina användarinställningar. Kontrollera din internetanslutning och försök igen :(', 'Misslyckades att spara');
        });
    });
  };

  function prepareFormData (formData, user) {
    for (var key in formData) {
      var value = formData[key];
      // If it's an array (either switch or food preferences)
      if (typeof value === 'object') {
        if (key == 'food_preferences') {
          if (value.length === 0 || value.length === 1 && value[0] === 'Annat') {
            value = [''];
          } else {
            // Remove 'Annat', change 'Mjölkallergi' to 'milk' and change every element to lower case in the food_preferences array
            value.forEach(function(element, index) {
              if (element == 'Annat') {
                value.splice(index, 1);
              } else if (element == 'Mjölkallergi') {
                value[index] = 'milk';
              } else {
                value[index] = element.toLowerCase();
              }
            });
          }
        } else {
          value = value[0] == 'on'; // Change the switch input value from ['on'] to true and [] to false
        }
        formData[key] = value;
      }
      user[key] = value;
    }
    formData.food_custom = foodCustom;

    // Update custom food data to local user variable
    user.food_custom = foodCustom;

    return formData;
  }

  if (app.device.ios) {
    window.addEventListener('native.keyboardshow', function() {
      app.popover.close('.picker.modal-in');
    });
  }
}
