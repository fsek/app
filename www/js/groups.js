function getGroups() {
  $.getJSON(API + '/groups')
    .then(function(resp) {
      $$('#groups-list ul').html('');
      var groups = resp.groups.reverse();
      var unread = 0;

      for (var group of groups) {
        var templateHTML = myApp.templates.groupTemplate(group);
        $$('#groups-list ul').append(templateHTML);
        unread += group.group_user.unread_count;
      }

      updateGroupBadge(unread);
    });
}

$$('#tab3').on('show', function() {
  // Get messages if we haven't done so already
  if($$('#groups-list ul').is(':empty')) getGroups();
});

$$('#groups-list').on('click', 'li', function() {
  // Redirect to messages page
  var groupId = $$(this).attr('id');
  var groupName = $$(this).find('.item-title').html();

  $$(this).removeClass('unread');
  updateGroupBadge(parseInt($$('#group-badge').html()) - $$(this).data('unread'));

  tabView3.router.load({
    url: 'messages.html',
    query: {groupId: groupId, groupName: groupName}
  });
});

function updateGroupBadge(count) {
  if (count > 0) {
    $$('#group-badge').html(count);
    $$('#group-badge').show();
  } else {
    $$('#group-badge').html(0);
    $$('#group-badge').hide();
  }
}
