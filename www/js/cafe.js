/*
 * TODO:
 * Ändra sina uppgifter knapp i formuläret
 * Autofill uppgifter om redan anmäld
 * Bläddra mellan veckorna istället för att scrolla
 * Om admin - kunna edita alla pass
 * Page where you can see the shifts you are signed up to in a list
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
      createDates(resp.cafe_shifts);
    });
});

var shiftDict = []; // Global s    o can reach from initSignUpPage

function createDates(shiftdata) {
  shiftDict = [];

  // Save info about first shift so we have something to compare with
  var date = new Date(shiftdata[0].start);
  var currentYear = date.getFullYear();
  var currentMonth = date.getMonth();
  var currentDay = date.getDay();
  var currentDate = date.getDate();
  var shiftid = shiftdata[0].id;

  // Save the first date in the dict
  monthString = monthNames[currentMonth];
  dayString = dayNames[currentDay];
  // Here you see the struct ure of the dict
  shiftDict.push({years: currentYear,
    months: [{days: [{shift: [],
      date: currentDate,
      day: dayString}],
    monthname: monthString}]
  });

  // Initialize some counter variables
  var counteryears = 0;
  var countermonths = 0;
  var counterdays = 0;
  var isme = false; // Use when coloring the shift-boxes
  var lasttimestring = 0;
  var timestring = 0;

  shiftdata.forEach(function(element) {
    date = new Date(element.start);
    shiftid = element.id;

    // Get name of user on shift and if it is me
    username = element.user;
    if (username !== null) {
      username = element.user.name;
      if (element.user.id === $.auth.user.id) {
        isme = true;
      } else {
        isme = false;
      }
    } else {
      isme = false;
    }

    var minutes = date.getMinutes().toString();
    if (minutes<10) {
      minutes = '0' + minutes;
    }
    timestring = date.getHours().toString()+':'+minutes;
    timestring = formattimestring(timestring, element, date);
    if (date.getFullYear() === currentYear) { //if same year as last element put in same year
      if (date.getMonth() === currentMonth) { //if same month as last month, put in same month
        if (date.getDay() === currentDay) { //if same day as last day, put in same day
          if (timestring === lasttimestring) {
            timestring = []; // Don't want to show time for all shifts - only first
          } else {
            lasttimestring = timestring;
          }
          // push the shifts into current day
          shiftDict[counteryears].months[countermonths].days[counterdays].shift.push({pass: element.pass,
            time: timestring,
            id: shiftid,
            name: username,
            me: isme});
        } else { // create new day if not same as last
          while (date.getDate()-currentDate>1) {
            currentDate++;
            if (currentDay<7) {
              currentDay++;
            } else {
              currentDay = 1; // if we would have a shift on a monday...
            }
            if (currentDay<6) {//Don't show weekends if no shift..
              counterdays++;
              dayString = dayNames[currentDay];
              shiftDict[counteryears].months[countermonths].days.push({shift: [], date: currentDate, day: dayString});
            } else {
              // TODO: maybe add something to distinguish weeks
            }
          }
          currentDay = date.getDay();
          currentDate = date.getDate();
          dayString = dayNames[currentDay];
          counterdays++;
          // push day into current month
          shiftDict[counteryears].months[countermonths].days.push({shift: [],
            date: currentDate,
            day: dayString});
          // push the first shift of the day into the day
          shiftDict[counteryears].months[countermonths].days[counterdays].shift.push({pass: element.pass,
            time: timestring,
            id: shiftid,
            name: username,
            me: isme});
          lasttimestring = timestring;
        }
      } else { // create new month if not same as last
        counterdays = 0;
        currentMonth = date.getMonth();
        currentDay = date.getDay();
        currentDate = date.getDate();
        dayString = dayNames[currentDay];
        countermonths++;
        monthString = monthNames[currentMonth];
        shiftDict[counteryears].months.push({days: [],
          monthname: monthString});
        shiftDict[counteryears].months[countermonths].days.push({shift: [],
          date: currentDate,
          day: dayString});
        shiftDict[counteryears].months[countermonths].days[counterdays].shift.push({pass: element.pass,
          time: timestring,
          id: shiftid,
          name: username,
          me: isme});
        lasttimestring = timestring;

      }
    } else { //If not same year as last element create new year
      countermonths = 0;
      counterdays = 0;
      counteryears++;
      currentYear = date.getFullYear();
      currentMonth = date.getMonth();
      currentDate = date.getDate();
      currentDay = date.getDay();
      monthString = monthNames[currentMonth];
      dayString = dayNames[currentDay];

      shiftDict.push({years: currentYear,
        months: [{days: [{shift: [],
          date: currentDate,
          day: dayString}],
        monthname: monthString}]
      });
      shiftDict[counteryears].months[countermonths].days[counterdays].shift.push({pass: element.pass,
        time: timestring,
        id: shiftid,
        name: username,
        me: isme});
      lasttimestring = timestring;
    }

  });

  // Send the dict to html
  var templateHTML = app.templates.cafeTemplate({years: shiftDict});
  var cafeList = $('#cafe-list');
  cafeList.html(templateHTML);
}

function formattimestring(timestring, element, date) {
  // Help function to format the timestring correct
  var timestringnew = timestring;
  var min = date.getMinutes().toString();
  if (element.pass === 1) {
    if (min <10) {
      min = '0' + min;
    }
    timestringnew += ' - '+ (date.getHours() + 2).toString() +':'+min;
  } else if (element.pass === 2) {
    if (min < 10) {
      min = '0' + min;
    }
    timestringnew += ' - '+ (date.getHours() + 3).toString() +':'+min;
  }
  return timestringnew;
}

$$(document).on('page:init', '.page[data-name="cafe-shift"]', function (e) {
  // Initialize the sign up page
  var shiftId = e.detail.route.params.shiftId;
  var isMe = e.detail.route.params.isMe;
  var user = $.auth.user;
  initSignUpPage(user, shiftId, isMe);
});

function initSignUpPage(user, shiftId, isMe) {
  // Get information about shift - use to write text in signup page
  var my_user = $.auth.user;
  var isMe = false;
  for (var year in shiftDict) {
    if (Object.prototype.hasOwnProperty.call(shiftDict, year)) {
      for (var month in shiftDict[year].months) {
        if (Object.prototype.hasOwnProperty.call(shiftDict[year].months, month)) {
          for (var day in shiftDict[year].months[month].days) {
            if (Object.prototype.hasOwnProperty.call(shiftDict[year].months[month].days, day)) {
              for ( var shift in shiftDict[year].months[month].days[day].shift) {
                if (Object.prototype.hasOwnProperty.call(shiftDict[year].months[month].days[day].shift, day)) {
                  id = shiftDict[year].months[month].days[day].shift[shift].id;
                  if (id == shiftId) { // Now get info about shift
                    isMe = shiftDict[year].months[month].days[day].shift[shift].me;
                    shift_user = shiftDict[year].months[month].days[day].shift[shift].name;
                    year_ = shiftDict[year];
                    month_ = shiftDict[year].months[month];
                    day_ = shiftDict[year].months[month].days[day];
                    shift_ = shiftDict[year].months[month].days[day].shift[shift];
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  $('#header_text').html('Anmälan till pass kl ' + shift_.time + '<br/>' + day_.day +' den ' + day_.date + ' ' + month_.monthname + ' ' + year_.years);

  var shift = {
    'id': shiftId,
    'name': user.firstname + ' ' + user.lastname,
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
  if (isMe===false) {
    // hide unsign button if not signed up yet
    $('.shift-unsign').hide();
  } else {

    /*
     * Here one could add the feature to update info on shif
     * but then one need to be able to edit a shift using ajax (TODO)
     */

    $('.shift-update').hide();
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
