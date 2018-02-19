myApp.onPageInit('contact', function(page) {
  $.getJSON(API + '/contacts')
    .done(function(resp) {
      var contacts = resp.contacts;
      initContactSelector(contacts, page);
      setDescription(contacts);
      $('.contact-button').on('click', function() {
        sendMessage(contacts, page);
      });
      // Event when content in div changes
      $('#contact-select .item-after').bind("DOMSubtreeModified", function() { 
        setDescription(contacts);
      });
      $('.contact-content .infinite-scroll-preloader').remove();
    })
    .fail(function(resp) {
      console.log(resp.statusText);
    });
});

function initContactSelector(contacts, page) {
  var selectedId = page.query.id;

  // Set Spindelman as default contact if not linked from an event
  if (selectedId == undefined) {
    selectedId = 1;
  }

  // Find name of the selected contact
  // contact.selected is set to true if the contact is the selected one, otherwise false
  var selectedName = '';
  for (contact of contacts) {
    if (contact.id == selectedId) {
      contact.selected = true;
      selectedName = contact.name;
    } else {
      contact.selected = false;
    }
  }
  // Load the template and the HTML for the contact selector
  var templateHTML = myApp.templates.contactTemplate({ contact: contacts, selectedName: selectedName });
  var contactContent = $('#contact-select');
  contactContent.html(templateHTML);
}


function sendMessage(contacts, page) {
  // Get data from form
  var formData = myApp.formToData('#contact-form');

  // If the textarea is filled 
  if (formData.message != '') {
    var user = $.auth.user;
    var contactData = { contact_message: {} }
    contactData.contact_message.name = user.firstname + ' ' + user.lastname;
    contactData.contact_message.email = user.email;
    contactData.contact_message.message = formData.message;

    // Find name of selected contact
    var contactName = $('select[name="contacts"] option:checked').val();

    // Find id of selected contact
    for (contact of contacts) {
      if (contact.name == contactName) {
        var contactId = contact.id;
      }
    }

    // Send request to send e-mail
    $.ajax({
      type: 'POST',
      dataType: 'json',
      url: API + '/contacts/' + contactId + '/mail',
      data: contactData,
      success: function(resp) {
        myApp.alert('Tack för att du har kontaktat oss! Ha en fin dag! :)', 'Tack!', function() {
          $('.contact-text textarea').val('');
        });
      },
      fail: function(resp) {
        myApp.alert('Ojdå! Det gick inte att skicka mailet, prova igen senare. :(', 'Felmeddelande!');
      }
    });

  // If the textarea is empty
  } else {
    myApp.alert('Du har inte skrivit något meddelande', 'Inget meddelande')
  }
}

function setDescription(contacts) {
  var contactName = $('select[name="contacts"] option:checked').val();
  var selectedText;
  for (contact of contacts) {
    if (contact.name == contactName) {
      selectedText = contact.text;
    }
  }
  $('#contact-description-title').html(contactName);
  $('#contact-description').html(selectedText);
}
