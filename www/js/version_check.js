/*
 * Checks if the API version in the app "appAPIVersion" matches the
 * web API version and if not, prompts a popup to force the user to update.
 */
function checkAPIVersion(apiVersion) {
  const localAPIVersion = 1.1;

  if (apiVersion !== localAPIVersion) {

    // Set the urls to the F-app on App Store and Google Play.
    const iosAppLink = 'https://itunes.apple.com/us/app/f-sektionen/id1272766590?mt=8';
    const androidAppLink = 'https://play.google.com/store/apps/details?id=se.fsektionen.fappprod';
    let appLink;

    if (app.device.ios) {
      appLink = iosAppLink;
    } else {
      appLink = androidAppLink;
    }

    let templateHTML = app.templates.apiVersionTemplate({
      appLink: appLink,
      easter: false
    });

    let popup = app.popup.create({
      content: templateHTML
    });
    popup.open();
  }
}

/*
 * Checks that the user has agreed to the terms of use of the app, and prompts them to do so if
 * they have not.
 */

function checkTermsVersion () {
  $.getJSON(API + '/versions')
    .done(function(resp) {
      termsVersionPopup(resp.terms_version);
    });
}

function termsVersionPopup (termsVersion) {
  //Prompts the user to accept the GDPR terms
  if ($.auth.user.terms_version !== termsVersion) {
    let templateHTML = app.templates.termsVersionTemplate({});
    let popup = app.popup.create({
      content: templateHTML
    });
    popup.open();

    //Changes user data to make sure they only have to accept GDPR once
    $('.accept-terms').on('click', function () {
      $.ajax({
        type: 'PATCH',
        dataType: 'json',
        url: API + '/users/' + $.auth.user.id + '/accept_terms',
        success: function() {
          $.auth.user.terms_version = termsVersion;
        },
        fail: function(resp) {
          app.dialog.alert(resp.data.errors);
        }
      });
    });
  }
}


