$$(document).on('page:init', '.page[data-name="contact"]', function (e) {
  $.getJSON(API + '/contacts')
    .done(function(resp) {
      var contacts = resp.contacts;
      initContactPage(contacts, e);
    })
    .fail(function(resp) {
      console.log(resp.statusText);
    });
});

function initContactPage(contacts, event) {
  // Add the contact options for the smart select and save the selected contact in the contacts object
  addContactOptions(contacts, event);

  // Init the smart select with the added options 
  initSmartSelect(contacts)
  
  // Add the selected contact's name and descrition to the page
  setDescription(contacts.selected_contact);

  $('.contact-button').on('click', function() {
    sendMessage(contacts.selected_contact);
  });

  $('.contact-content .infinite-scroll-preloader').remove();


  function addContactOptions(contacts, event) {
    var selectedId = event.detail.route.params.contactId;

    // Find which option is selected and save that contact in the contacts object 
    // contact.selected is set to true if the contact is the selected one, otherwise false
    var selectedName = '';
    for (contact of contacts) {
      contact.selected = contact.id == selectedId;

      if(contact.selected) {
        contacts.selected_contact = contact;
      }
    }

    // Load the template and the HTML for the contact options
    var templateHTML = app.templates.contactTemplate({ contact: contacts });
    $('#contact-select').html(templateHTML);
  }

  function initSmartSelect(contacts){
    app.smartSelect.create({
      el: '#contact-select',
      openIn: 'popup',
      popupCloseLinkText: 'Tillbaka',
      searchbar: true,
      searchbarPlaceholder: 'Sök efter kontaktperson',
      searchbarDisableText: 'Avbryt',
      closeOnSelect: true,
      on: {
        close: function(smartSelect) {
          var selectedName = $('#contact-select .item-after')[0].innerHTML;
          contacts.forEach(function(contact){
            if(contact.name == selectedName) {
              contacts.selected_contact = contact;
            }
          });

          setDescription(contacts.selected_contact);
        },
      }
    });
  }

  function setDescription(selectedContact) {
    console.log(selectedContact)
    $('#contact-description-title').html(selectedContact.name);
    $('#contact-description').html(selectedContact.text);
    $('#contact-email').html('<span>E-post: </span>' + selectedContact.email);
  }

  function sendMessage(selectedContact) {
    // Get data from form
    var formData = app.form.convertToData('#contact-form');

    // If the textarea is filled 
    if (formData.message != '') {
      var user = $.auth.user;
      var contactData = { contact_message: {} }
      contactData.contact_message.name = user.firstname + ' ' + user.lastname;
      contactData.contact_message.email = user.email;
      contactData.contact_message.message = formData.message;

      // Send POST request to send e-mail
      $.ajax({
        type: 'POST',
        dataType: 'json',
        url: API + '/contacts/' + selectedContact.id + '/mail',
        data: contactData,
        success: function(resp) {
          $('.contact-text textarea').val('');
          app.dialog.alert('Tack för att du har kontaktat oss! Vi kommer svara så snabbt vi kan. Ha en fortsatt fin dag! :)', 'Meddelande skickat');
        },
        fail: function(resp) {
          app.dialog.alert('Ojdå! Det gick inte att skicka mailet, prova igen senare. :(', 'Felmeddelande!');
        }
      });
    } else {
      app.dialog.alert('Du har inte skrivit något meddelande', 'Inget meddelande')
    }
  }
}
