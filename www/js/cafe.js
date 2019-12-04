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

let shiftDict = []; // Global so can reach from initSignUpPage

function createDates(shiftdata) {

  /*
   * Display all shifts
   */
  shiftDict = shiftdata;
  shiftdata.me = $.auth.user;
  shiftdata.BASE_URL = BASE_URL;
  const templateHTML = app.templates.cafeTemplate(shiftdata);
  const cafeList = $('#cafe-list');
  cafeList.html(templateHTML);

}


$$(document).on('page:init', '.page[data-name="cafe-shift"]', function (e) {

  /* Initialize the sign up page */
  const shiftId = e.detail.route.params.shiftId;
  const isMe = e.detail.route.params.isMe;
  const start = e.detail.route.params.start;
  initSignUpPage(shiftId, isMe, start);
});

function initSignUpPage(shiftId, isMe, start) {

  /* Get information about shift - use to write text in signup page */
  const myUser = $.auth.user;
  const str = start.split('-');
  const y = str[0];
  const m = str[1]-1;
  const d = str[2].split('T')[0];
  const time = str[2].split('T')[1];
  const hours = time.split(':')[0];
  const minutes = time.split(':')[1];
  const shiftDate = new Date(start);

  // Different text if user already is signed up to shift
  if (isMe === "true") {
    $('#header_text').html('Du är anmäld till pass kl ' + hours +':'+ minutes + '<br/>' + dayNames[shiftDate.getDay()] +' den ' + d + ' ' + monthNames[m] + ' ' + y);
  } else {
    $('#header_text').html('Anmälan till pass kl ' + hours +':'+ minutes + '<br/>' + dayNames[shiftDate.getDay()] +' den ' + d + ' ' + monthNames[m] + ' ' + y);
  }

  const shift = {
    'id': shiftId,
    'name': myUser.firstname + " " + myUser.lastname,
    'committee': '',
    'group': '',
    'competition': 'yes'};

  console.log(isMe)
  app.form.fillFromData('#shift-form', shift);

  // get all possible councils
  const councilsName = [];
  const councilsAll = {}; // connect id with council name

  $.getJSON(API + '/councils')
    .done(function(resp) {
      for (let c in resp.councils) {
        councilsName.push(resp.councils[c].title);
        councilsAll[resp.councils[c].title] = resp.councils[c].id;
      }
    });
  // initialize scroll council picker
  const committeePicker = app.picker.create({
    inputEl: '#user-committee-input',
    rotateEffect: true,
    toolbarCloseText: 'Klar',
    cols: [
      {
        textAlign: 'center',
        values: councilsName,
      }
    ]
  });

  $('.shift-update').on('click', function() {
    updateShift(shift, councilsAll);
  });

  $('.shift-unsign').on('click', function() {
    unsignShift(shift, councilsAll);
  });

  if (isMe == 'true') {
    // hide unsign button if not signed up yet
    $('.shift-update').hide();
  } else {
    // hide signup button if siged up
    $('.shift-unsign').hide();
  }
}

function updateShift(shift, councilsall) {
  //Update shift with it's new user
  const shiftData = app.form.convertToData('#shift-form');
  // Check answer to cafe competition
  if (shiftData.switch.length === 0) {
    shift.competition = false;
  } else {
    shift.competition = true;
  }
  shift.committee = shiftData.committee;
  shift.group = shiftData.group;

  // Send info to server and finn in acctual shift
  $.ajax({
    url: API + '/cafe',
    type: 'POST',
    dataType: 'json',
    data: {
      cafe_shift_id: shift.id,
      cafe_worker: {
        user_id: $.auth.user.id,
        council_ids: [councilsall[shift.committee]],
        group: shift.group,
        competition: shift.competition
      }
    },
    success: function() {
      alternativesView.router.back('/cafe/',{force: true}); // force: reload page
      app.dialog.create({
        title: 'Du är nu uppskriven på passet! ',
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

  /* Unsign from shift */
  $.ajax({
    url: API + '/cafe/'+shift.id,
    type: 'DELETE',
    dataType: 'json',
    success: function() {
      alternativesView.router.back('/cafe/',{force: true});

      app.dialog.create({
        title: 'Du är nu avanmäld från passet! ',
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
