$$(document).on('page:init', '.page[data-name="tab5"]', function (page) {
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
          $('#notification-list ul').empty();
          deletePushAndSignOut();
          tabView1.router.back({
            animatePages: false
          });
          $('.toolbar-inner').find('.active').removeClass('active');
          app.showTab('#login');
          app.showTab('#subtab1');
        }
      }
    ];
    var cancel = [
        {
          text: 'Avbryt'
        }
    ];
    var signoutAction = [signoutBtn, cancel];
    app.actions(this, signoutAction);
  });
}).trigger();
