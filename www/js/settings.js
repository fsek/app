myApp.onPageInit('settings', function (page) {
  $('.signout').on('click', function(){
    var signoutBtn = [
      {
        text: 'Är du säker på att du vill logga ut?',
        label: true
      },
      {
        text: 'Logga ut',
        color: 'red',
        //loads settings page after second login, also buggs after logout to login help to login
        onClick: function(){ 
          $(calendar).empty();
          $.auth.signOut();
          $('#tab1 .page-on-left').addClass('cached');
          mainView.router.load({
            url: 'login.html'
          });
        }
      }
    ];
    var cancel = [
        {
          text: 'Avbryt'
        }
    ];
    var signoutAction = [signoutBtn, cancel];
    myApp.actions(this, signoutAction);
  });
});
