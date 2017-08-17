$$('#tab5').on('tab:show', function () {
  $('.signout-btn').on('click', function(){
    var signoutBtn = [
      {
        text: 'Är du säker på att du vill logga ut?',
        label: true
      },
      {
        text: 'Logga ut',
        color: 'red',
        onClick: function(){
          $(calendar).empty();
          deletePushAndSignOut();
          tabView1.router.back({
            animatePages: false
          });
          $('.toolbar-inner').find('.active').removeClass('active');
          myApp.showTab('#login');
          myApp.showTab('#subtab1');
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
