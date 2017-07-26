function getGroups() {
  $.getJSON(API + '/groups')
    .then(function(resp) {
      var groups = resp.groups.reverse();

      for (var group of groups) {
        var templateHTML = myApp.templates.groupTemplate(group);
        $$('#groups-list ul').append(templateHTML);
      }
    });
}

$$('#tab4').on('show', function() {
  // Get messages if we haven't done so already
  if($$('#groups-list ul').is(':empty')) getGroups();
});

$$('#groups-list').on('click', 'li', function() {
  // Redirect to messages page
  var groupId = $$(this).attr('id');
  var groupName = $$(this).find('.item-title').html();

  tabView4.router.load({
    url: 'messages.html',
    query: {groupId: groupId, groupName: groupName}
  });
});
