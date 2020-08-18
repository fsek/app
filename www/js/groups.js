function getGroups() {
  $.getJSON(API + '/groups')
    .then(function(resp) {
      app.ptr.done($$('.group-content.ptr-content'));
      var groupEl = $$('#groups-list ul');
      groupEl.html('');
      var groups = resp.groups.reverse();
      var unread_new = 0;
      var hasGroups = groups.length !== 0;
      var templateHTML = '';
      if (hasGroups) {
        for (var group of groups) {
          unread_new += group.group_user.unread_count;
          templateHTML += app.templates.groupTemplate({group: group,
            hasGroups: hasGroups});
        }
        groupEl.removeClass('no-groups');
      } else if (!groupEl.hasClass('no-groups')) {
        templateHTML = app.templates.groupTemplate({group: null,
          hasGroups: hasGroups});
        groupEl.addClass('no-groups');
      }

      groupEl.html(templateHTML);
      updateGroupBadge(unread_new);
    });
}

// Only a function for the nollning page for the group notification badge
function setGroupNotification() {
  $.getJSON(API + '/groups')
    .then(function(resp) {
      const groups = resp.groups.reverse();
      let unread = 0;
      const hasGroups = groups.length !== 0;
      if (hasGroups) {
        for (var group of groups) {
          unread += group.group_user.unread_count;
        }
      }
      $('.nollning-content').addClass('loaded');
      updateGroupBadge(unread);
    });
}

$$(document).on('page:init', '.page[data-name="groups"]', function (e) {
  // Get messages if we haven't done so already
  if ($$('#groups-list ul').is(':empty')) getGroups();

  $$('.ptr-content.group-content').on('ptr:refresh', function() {
    getGroups();
  });
});

$$('#groups-list').on('click', 'li', function() {
  $$(this).removeClass('unread');
  updateGroupBadge(parseInt($$('.group-badge').html(), 10) - $$(this).data('unread'));
});

function updateGroupBadge(count) {
  if (count > 0) {
    $$('.group-badge').html(count);
    $$('.group-badge').show();
  } else {
    $$('.group-badge').html(0);
    $$('.group-badge').hide();
  }
}
