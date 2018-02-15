// We need to add the selected attribute on the food pref options before init otherwise
// the smart select page wont load the options properly
myApp.onPageBeforeInit('user-page', function (page) {
  var options = $('.user-content option');
  var foodPreferences = $.auth.user.food_preferences

  // Get rid of an empty element in the array that somtimes comes from the form
  var emptyIndex = foodPreferences.indexOf('');
  if(emptyIndex > -1){
    foodPreferences.splice(emptyIndex, 1);
  }

  if(foodPreferences.length != 0){
    // Changes 'milk' to 'mjölkallergi' to match the options
    var milkIndex = foodPreferences.indexOf('milk');
    if(milkIndex > -1){
      foodPreferences[milkIndex] = 'mjölkallergi'
    }

    // Add 'selected' attribute to the options that match the user.food_preferences elements
    // length-1 because we don't need to check for the last option 'annat'
    for(var i = 0; i < options.length - 1; i++){ 
      // use foodPreferences.indexOf(option) istead??????
      foodPreferences.forEach(function(element){
        if(options[i].innerHTML.toLowerCase() == element){
          options[i].setAttribute('selected', '');
        }
      })
    }
  }

  // Add 'selected' attribute to the 'Annat' option if food_custom exists 
  if($.auth.user.food_custom != ''){
    options[options.length-1].setAttribute('selected', '')
  }
});

myApp.onPageInit('user-page', function (page) {
  var user = $.auth.user;
  var settingsChanged = false;
  var userContent = $('.user-content');
  
  // Add first and last name to the user container text
  userContent.find('.user-container p').html(user.firstname + ' ' + user.lastname);

  // Set correct avatar URL (adds the base url) and add it as background image on the user-avatar
  var avatarURL = '';
  if(user.avatar.thumb.url != null){
    avatarURL = BASE_URL + user.avatar.thumb.url;
  }else{
    avatarURL = '../img/missing_thumb.png';
  }
  userContent.find('.user-avatar').css('background-image', 'url(' + avatarURL + ')');
  
  // Adds 'inga' to the item-after object if there is no food preferences
  if(user.food_preferences.length == 0 && user.food_custom == '') {
    userContent.find('.user-food-pref .item-after').html('Inga');
  }

  // Add member date to the page while setting it to the fullDate type
  var memberDate = new Date(user.member_at).fullDate();
  userContent.find('#user-member-at').html('Medlemskap sedan ' + memberDate);

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
  };
  myApp.formFromData('#user-form', formData);

  // Setup program picker
  var programPicker = myApp.picker({
    input: '#user-program-input',
    toolbarCloseText: 'Klar',
    cols: [
      {
        textAlign: 'center',
        values: ['Teknisk Fysik', 'Teknisk Matematik', 'Teknisk Nanovetenskap', 'Oklart'],
      }
    ]
  });
  // F7 sucks and the picker isn't initialized till opened, so you can't set the value???
  programPicker.open();
  programPicker.close();
  programPicker.setValue([user.program])

  // Create array with start year alternatives (all years from 1954)
  var startYears = [];
  var thisYear = new Date().getFullYear();
  for(var i = 0; i <= thisYear - 1961; i++){
    startYears[i] = thisYear - i;
  }

  // Setup start year picker
  var startYearPicker = myApp.picker({ // ON OPEN VISAR INTE RÄTT VÄRDE
    input: '#user-startyear-input',
    toolbarCloseText: 'Klar',
    cols: [
      {
        textAlign: 'center',
        values: startYears,
      }
    ]
  });
  // F7 sucks and the picker isn't initialized till opened, so you can't set the value???
  startYearPicker.open();
  startYearPicker.close();
  startYearPicker.setValue([user.start_year])  

  $('.user-update').on('click', function(){
    // Open preloader that closes after 0.8s and updates the name text
    myApp.showPreloader('Sparar inställningar');
    var hidePreloader = false;
    setTimeout(function(){
      if(hidePreloader){
        myApp.hidePreloader();
        userContent.find('.user-container p').html(user.firstname + ' ' + user.lastname);
      }else{
        hidePreloader = true;
      }
    }, 800);

    // Get data from the form
    var formData = myApp.formToData('#user-form');

    // Edit the form data and update formData and the user object
    for(var key in formData){
      var value = formData[key];
      if(typeof value === 'object'){ // If it's an array
        if(key == 'food_preferences'){
          if(value.length != 0){
            // Remove 'Annat', change 'Mjölkallergi' to 'milk' and every element to lower case in the food_preferences array
            value.forEach(function(element, index){
              if(element == 'Annat'){
                value.splice(index, 1);
              }else if(element == 'Mjölkallergi'){
                value[index] = 'milk';
              }else {
                value[index] = element.toLowerCase();
              }
            });
          }else{
            value = [''];
          }
        }else{
          value = value[0] == 'on';   // Change the switch input value from ['on'] to true and [] to false
        }
        formData[key] = value;
      }
      user[key] = value;
    }

    // Add the custom food preference to formData
    formData.food_custom = $.auth.user.food_custom;

    // Sen and ajax PUT request to update the user setting with formData
    var user_data = {user: formData};
    $.ajax({
      type: 'PUT',
      dataType: 'json',
      url: API + '/users/' + user.id,
      data: user_data,
      success: function(resp) {
        if(hidePreloader){
          myApp.hidePreloader();
          userContent.find('.user-container p').html(user.firstname + ' ' + user.lastname);
        }else{
          hidePreloader = true;
        }
        //console.log(resp)
      },
      error: function(resp) {
        myApp.hidePreloader();
        myApp.alert('Kunde inte uppdatera dina användarinställningar. Kontrollera dina fält.', 'Misslyckades att spara')
        //console.log(resp)
      }
    });

    settingsChanged = false;
  });

  // Alert if anything has changed and go back to previous page (the settings tab)
  $('.song-back').on('click', function(e){
    if(settingsChanged){
      myApp.confirm('Alla opsarade inställningar kommer förintas. Är du säker på att du vill överge din ändringar?', 'Osparade ändringar', function () {
        myApp.getCurrentView().router.back();
      });
    }else{
      myApp.getCurrentView().router.back();
    }
  })

  // Set settingChanged to true when the change event is triggered for all inputs and the smart select
  $('.user-content input').on('change', function(){
    settingsChanged = true;
  });

  $('select[name="food_preferences"]').on('change', function(){
    settingsChanged = true;
  });
});

$$(document).on('page:init', '.page[data-select-name="food_preferences"]', function (page) {
  var page = $(page.target);
  var otherInputHTML = '<li id="option-other">' +
                          '<div class="item-content">' +
                            '<div class="item-inner">' +
                              '<div class="item-input">' +
                                '<input name="other" type="text" placeholder="Andra matpreferenser/allergier">' +
                              '</div>' +
                            '</div>' +
                          '</div>' +
                        '</li>';
  var optionValue = $.auth.user.food_custom;
  var optionOther = $('.user-content option')[5];

  // Adds the input html if the 'Annat' option is selected (has the 'selected' attribute)
  var isOtherSelected = optionOther.hasAttribute('selected');
  if(isOtherSelected){ 
    page.find('ul').append(otherInputHTML);
    $('#option-other input')[0].value = optionValue;
  }

  // On click event for the 'other' food preference alternative which adds/removes the input html dynamically while saving the input value
  var otherListItem = page.find('li')[5];
  $(otherListItem).on('click', function(e){
    if(!isOtherSelected){
      optionOther.setAttribute('selected', '');
      page.find('ul').append(otherInputHTML);
      $('#option-other input')[0].value = optionValue;
    }else{
      optionValue = $('#option-other input')[0].value;
      optionOther.removeAttribute('selected');
      page.find('#option-other').remove();
    }

    isOtherSelected = !isOtherSelected;
  });
});

// Update selected options to 'Inga' if nothing was selected in page:back event for the smart-select page
// Also updates food_custom to either the input value (if the 'Annat' input was found) otherwise an empty string 
$$(document).on('page:back', '.page[data-select-name="food_preferences"]', function (page) {
  var selectedOptions = $('.user-food-pref .item-after');  
  if(selectedOptions.html() == ''){
    selectedOptions.html('Inga');
  }

  var otherInput = $('#option-other input');
  if(otherInput.length != 0){
    $.auth.user.food_custom = otherInput[0].value;
  }else{
    $.auth.user.food_custom = '';
  }
});
