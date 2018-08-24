let keyIndex = 0;
$('#home-btn, #cal-btn, #noti-btn, #msg-btn').on('click', function() {
  var id = $(this).attr('id');
  var idNbr = -1;
  switch (id) {
    case 'home-btn':
      idNbr = 0;
      break;
    case 'cal-btn':
      idNbr = 1;
      break;
    case 'msg-btn':
      idNbr = 2;
      break;
    case 'noti-btn':
      idNbr = 3;
      break;
  }

  const key = [0,0,0,0,0,0,1,2,2,3,3];
  if (key[keyIndex] === idNbr) {
    if (keyIndex === 10) {
      app.dialog.alert('Gratulerar! Du har hittat ett av appens easter eggs!','Ett Easter Egg!');
      keyIndex = 0;
    } else {
      keyIndex++;
    }
  } else {
    keyIndex = 0;
  }
});
