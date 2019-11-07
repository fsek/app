/*
 * TODO:
 * Ändra sina uppgifter knapp i formuläret
 * Autofill uppgifter om redan anmäld
 * Bläddra mellan veckorna istället för att scrolla
 * Om admin - kunna edita alla pass
 * Page where you can see the shifts you are signed up to in a list
 * ---------------------
 * Tidsformat på string
 * Siffra till måndad
 * Dag till siffra
 */
$$(document).on('page:init', '.page[data-name="cafe"]', function () {
  // Want to collect existing shifts between today and end
  var date = new Date();
  const today = date.yyyymmdd();
  date.setDate(date.getDate()+49);
  const end = date.yyyymmdd();

  /*
   * Collect all sifts between the two dates
   * NOTE: It is important that the shifts are ordered chronological
   */
  $.getJSON(API + '/cafe?start='+today+'&end='+end)
    .done(function(resp) {
      createDates(resp);
    });

});

var shiftDict = []; // Global s    o can reach from initSignUpPage

function createDates(shiftdata) {
  shiftDict = shiftdata;
  console.log(shiftdata);

  shiftdata["me"] = $.auth.user;
  shiftdata["BASE_URL"] = BASE_URL;
  var templateHTML = app.templates.cafeTemplate(shiftdata);
  var cafeList = $('#cafe-list');
  cafeList.html(templateHTML);
}


$$(document).on('page:init', '.page[data-name="cafe-shift"]', function (e) {
  // Initialize the sign up page
  var shiftId = e.detail.route.params.shiftId;
  var isMe = e.detail.route.params.isMe;
  var start = e.detail.route.params.start;
//  var info = e.detail.route.params;
  //console.log(isMe);
  initSignUpPage(shiftId, isMe, start);
});

function initSignUpPage(shiftId, isMe, start) {
  // Get information about shift - use to write text in signup page
  var my_user = $.auth.user;

  //console.log(my_user);
  //console.log(shiftId);
  //console.log(start.getMonth());
  var str = start.split('-');
  var y = str[0];
  var m = str[1]-1;
  var d = str[2].split('T')[0];
  var time = str[2].split('T')[1];
  var hours = time.split(':')[0];
  var minutes = time.split(':')[1];
//  var shift_date = new Date(y, m, d, hours, minutes); // TODO!
  var shift_date = new Date(start);
  console.log('here');
  console.log(shift_date.getDay());

//  console.log(shiftDict['years'][y]['months'][m]['days'][d]);//

  //  thisDay = shiftDict['years'][y]['months'][m]['days'][d];
  //for (var shift in thisDay){
  //  if (thisDay.hasOwnProperty(keys)) {
  //    console.log(shiftDict[keys]);
  //    if (thisDay[shift]['id'] == shiftId)
  //  }
  //}

  if (isMe == 'true') {
    $('#header_text').html('Du är anmäld till pass kl ' + hours +':'+ minutes + '<br/>' + dayNames[shift_date.getDay()] +' den ' + d + ' ' + monthNames[m] + ' ' + y);
// Här hade man nog kunnat hämta info om passet och fylla i om man
  } else {
    $('#header_text').html('Anmälan till pass kl ' + hours +':'+ minutes + '<br/>' + dayNames[shift_date.getDay()] +' den ' + d + ' ' + monthNames[m] + ' ' + y);
  }

  var shift = {
    'id': shiftId,
    'name': my_user.firstname + ' ' + my_user.lastname,
    'committee': '',
    'competition': 'yes'};

  app.form.fillFromData('#shift-form', shift);

  // get all possible councils
  var councils_name = [];
  var councils_all = {}; // connect id with council name
  $.getJSON(API + '/councils')
    .done(function(resp) {
      for (var c in resp.councils) {
        councils_name.push(resp.councils[c].title);
        councils_all[resp.councils[c].title] = resp.councils[c].id;
      }
    });
  // initialize scroll council picker
  var committeePicker = app.picker.create({
    inputEl: '#user-committee-input',
    rotateEffect: true,
    toolbarCloseText: 'Klar',
    cols: [
      {
        textAlign: 'center',
        values: councils_name,
      }
    ]
  });
  $('.shift-update').on('click', function() {
    updateShift(shift, councils_all);
  });
  $('.shift-unsign').on('click', function() {
    unsignShift(shift, councils_all);
  });
  if (isMe == 'true') {
    // hide unsign button if not signed up yet
    $('.shift-update').hide();

  } else {
    console.log('is me is false')
    $('.shift-unsign').hide();

    /*
     * Here one could add the feature to update info on shif
     * but then one need to be able to edit a shift using ajax (TODO)
     */

  }

}

function updateShift(shift, councilsall) {
  //Update shift with it's new user
  var shiftData = app.form.convertToData('#shift-form');
  // Check answer to cafe competition
  if (shiftData.switch.length === 0) {
    shift.competition = false;
  } else {
    shift.competition = true;
  }
  shift.committee = shiftData.committee;

  // Send info to server and finn in acctual shift
  $.ajax({
    url: API + '/cafe',
    type: 'POST',
    dataType: 'json',
    data: {
      cafe_shift_id: shift.id,
      cafe_worker: {
        user_id: $.auth.user.id,
        council_ids: councilsall[shift.committee],
        group: shift.group,
        competition: shift.competition
      }
    },
    success: function() {
      alternativesView.router.back('/cafe/',{force: true}); // force: reload page
      app.dialog.create({
        title: 'Nu är du uppskriven på passet! ',
        text: 'Tack för att du vill jobba i caféet! Kom ihåg att avanmäla dig om du får förhinder.',
        buttons: [
          {
            text: 'Ok',
          }
        ],
        horizontalButtons: true,
      }).open();
    },
    error: function() {
      // Fail if already signed up on shift at the same time
      alternativesView.router.back('/cafe/',{force: true});

      app.dialog.create({
        title: 'Något gick fel! ',
        text: 'Du kanske redan är anmäld på ett pass vid samma tid?',
        buttons: [
          {
            text: 'Ok',
          }
        ],
        horizontalButtons: true,
      }).open();
    }
  });
}

function unsignShift(shift) {
  $.ajax({
    url: API + '/cafe/'+shift.id,
    type: 'DELETE',
    dataType: 'json',
    success: function() {
      alternativesView.router.back('/cafe/',{force: true});

      app.dialog.create({
        title: 'Nu är du nu avanmäld från passet! ',
        text: 'Tipsa en kompis om att anmäla sig på passet istället!',
        buttons: [
          {
            text: 'Ok',
          }
        ],
        horizontalButtons: true,
      }).open();
    },
    error: function() {
      alternativesView.router.back('/cafe/',{force: true});

      app.dialog.create({
        title: 'Något gick fel! ',
        text: 'Det gick inte att avanmäla dig från passet.',
        buttons: [
          {
            text: 'Ok',
          }
        ],
        horizontalButtons: true,
      }).open();

    }
  });
}
