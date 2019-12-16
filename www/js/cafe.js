$$(document).on('page:init', '.page[data-name="cafe"]', function () {

  /*
   * Collect all sifts between the two dates
   * NOTE: It is important that the shifts are ordered chronological
   */
  const date = new Date();
  const today = date.yyyymmdd();

  date.setDate(date.getDate()+49);
  const end = date.yyyymmdd();

  $.getJSON(API + '/cafe?start='+today+'&end='+end)
    .done(function(resp) {
      createDates(resp);
    });

});

function createDates(shiftdata) {

  // Display all shifts
  shiftdata.me = $.auth.user;
  shiftdata.BASE_URL = BASE_URL;
  const templateHTML = app.templates.cafeTemplate(shiftdata);
  const cafeList = $('#cafe-list');
  cafeList.html(templateHTML);
}


$$(document).on('page:init', '.page[data-name="cafe-shift"]', function (e) {

  const shiftId = e.detail.route.params.shiftId;

  $.getJSON(API + `/cafe/${shiftId}`)
    .done(function(resp) {
      // Initialize the sign up page
      initSignUpPage(resp.cafe_shift);
    });
});

function initSignUpPage(shiftData) {
  // Get information about shift - use to write text in signup page
  const myUser = $.auth.user;
  const shiftDate = new Date(shiftData.start);

  // Different text if user already is signed up to shift
  let headerText = '';
  if (shiftData.isme) {
    headerText = 'Du är anmäld ';
    $('#shift-form ul').addClass('disabled');

  } else {
    headerText = 'Anmälan ';
  }
  headerText += `till pass kl ${shiftDate.hhmm()} <br/> ${shiftDate.getDayName()} den  ${shiftDate.getDate()}  ${monthNames[shiftDate.getMonth()]}`;
  $('#header_text').html(headerText);

  // Create shift object to fill form with data
  const shift = {
    'id': shiftData.id,
    'name': `${myUser.firstname} ${myUser.lastname}`,
    'group': shiftData.group,
    'competition': 'yes'
  };

  // Add smart select options dynamically and set selected values
  for (council in shiftData.councils.available) {
    $('.council-select select').append(`<option value="${council}">${council}</option>`);
  }
  app.smartSelect.get('.council-select').setValue(Object.keys(shiftData.councils.chosen));

  app.form.fillFromData('#shift-form', shift);

  $('.shift-create').on('click', function() {
    createShift(shift, shiftData.councils.available);
  });

  $('.shift-destroy').on('click', function() {
    unsignShift(shift);
  });

  if (shiftData.isme) {
    // Hide unsign button if not signed up yet
    $('.shift-destroy').removeClass("hidden");
  } else {
    // Hide signup button if siged up
    $('.shift-create').removeClass("hidden");
  }
}

function createShift(shift, councils) {
  // Create shift with current user
  const shiftData = app.form.convertToData('#shift-form');

  // Check answer to cafe competition
  if (shiftData.switch.length === 0) {
    shiftData.competition = false;
  } else {
    shiftData.competition = true;
  }

  // Send info to server and finn in acctual shift
  $.ajax({
    url: API + '/cafe',
    type: 'POST',
    dataType: 'json',
    data: {
      cafe_shift_id: shift.id,
      cafe_worker: {
        user_id: $.auth.user.id,
        council_ids: shiftData.councils.map((c) => councils[c]),
        group: shiftData.group,
        competition: shiftData.competition
      }
    },
    success: function() {
      app.dialog.create({
        title: 'Du är nu uppskriven på passet!',
        text: 'Tack för att du vill jobba i caféet! Kom ihåg att avanmäla dig om du får förhinder.',
        buttons: [
          {
            text: 'Ok',
          }
        ],
        horizontalButtons: true,
        on: {
          close: closeCafeShiftPage
        }
      }).open();
    },
    error: function() {
      app.dialog.create({
        title: 'Något gick fel!',
        text: 'Du kanske redan är anmäld på ett pass vid samma tid?',
        buttons: [
          {
            text: 'Ok',
          }
        ],
        horizontalButtons: true,
        on: {
          // Fail if already signed up on shift at the same time
          close: closeCafeShiftPage
        }
      }).open();
    }
  });
}

function unsignShift(shift) {

  /* Unsign from shift */
  $.ajax({
    url: API + '/cafe/' + shift.id,
    type: 'DELETE',
    dataType: 'json',
    success: function() {
      app.dialog.create({
        title: 'Du är nu avanmäld från passet!',
        text: 'Tipsa en kompis om att anmäla sig på passet istället!',
        buttons: [
          {
            text: 'Ok',
          }
        ],
        horizontalButtons: true,
        on: {
          close: closeCafeShiftPage
        }
      }).open();
    },
    error: function() {
      app.dialog.create({
        title: 'Något gick fel!',
        text: 'Det gick inte att avanmäla dig från passet.',
        buttons: [
          {
            text: 'Ok',
          }
        ],
        horizontalButtons: true,
        on: {
          close: closeCafeShiftPage
        }
      }).open();
    }
  });
}

function closeCafeShiftPage () {
  // force: reload
  alternativesView.router.back('/cafe/', {force: true});
}
