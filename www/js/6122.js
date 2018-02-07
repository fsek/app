var inc = 0;
$('#home-btn, #cal-btn, #not-btn, #msg-btn').on('click', function() {
  var id = $(this).attr('id');
  var idtrans;
  switch (id) {
    case 'home-btn':
      idtrans = 0;
      break;
    case 'cal-btn':
      idtrans = 1;
      break;
    case 'msg-btn':
      idtrans = 2;
      break;
    case 'not-btn':
      idtrans = 3;
    break;
  }
  var order = [0,0,0,0,0,0,1,2,2,3,3]
  if(order[inc] !== idtrans) {
    inc = -1
  }
  if(inc == -1 && idtrans == 0) {
    inc= 0
  }
  if(inc==10){
    myApp.alert('Gratulerar! Du har hittat ett av appens easter eggs!','Ett Easter Egg!');
  } else {
    inc++;
  }
});
