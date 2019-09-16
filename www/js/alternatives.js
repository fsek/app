$$(document).on('page:init', '.page[data-name="alternatives"]', function () {
  var signoutAction = app.actions.create({
    buttons: [
      {
        text: 'Är du säker på att du vill logga ut?',
        label: true
      },
      {
        text: 'Logga ut',
        color: 'red',
        onClick: function() {
          $(calendar).empty();
          $('#notification-list ul').empty();
          $$('#groups-list ul').empty();

          // Unregister push device and signout with $.auth
          deletePushAndSignOut();

          // Go back from events subtab to news
          app.tab.show('#subtab1');

          // Clear login inputs
          $('#login-form input[name="email"]').val('');
          $('#login-form input[name="password"]').val('');
          $('.nollning-moose').removeClass('nollning-moose-orange');

          loginScreen.open();
        }
      },
      {
        text: 'Avbryt'
      }
    ]
  });

  $('.signout-btn').on('click', function() {
    signoutAction.open();
  });
});
