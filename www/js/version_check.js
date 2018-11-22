/*
 * Checks if the API version in the app "appAPIVersion" matches the
 * web API version and if not, prompts a popup to force the user to update.
 */
function checkAPIVersion(appAPIVersion) {
  $.getJSON(API + '/versions')
    .done(function(resp) {
      if (resp.current_version !== appAPIVersion) {

        // Set the urls to the F-app on App Store and Google Play.
        var iosAppLink = 'https://itunes.apple.com/us/app/f-sektionen/id1272766590?mt=8';
        var androidAppLink = 'https://play.google.com/store/apps/details?id=se.fsektionen.fappprod';
        var appLink;

        if (app.device.ios) {
          appLink = iosAppLink;
        } else {
          appLink = androidAppLink;
        }

        var templateHTML = app.templates.versionCheckTemplate({
          appLink: appLink, 
          easter: false
        });

        var popup = app.popup.create({
          content: templateHTML
        });
        popup.open();
      }
    })
    .fail(function(resp) {
      console.log(resp.statusText);
    });
}
