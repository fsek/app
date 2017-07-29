//Configuration of the event page
myApp.onPageInit('event', function (page) {
  var clickedEvent = page.query.eventId;
  var eventData = '';
  console.log('event opened');
  $('.tabbar').hide();
  $('.toolbar').hide();

  $.getJSON(API + '/events/' + clickedEvent)
  .done(function(resp){
    eventData = resp;
    console.log(resp.event);
    for(var key in resp.event){
      var keyValue = resp.event[key];
      if(keyValue !== null && keyValue.length !== 0 && keyValue !== false){
        console.log(key + ':', resp.event[key]);
      }
    }
    $('.event-info').empty();
    $('.event-info').append(
      '<div class="event-title">' + resp.event.title + '</div>' +
      '<div class="event-time">' + resp.event.starts_at + '-' + resp.event.ends_at + '</div>' +
      '<div class="event-place">' + resp.event.location + '</div>' +
      '<div class="event-dress-code">' + resp.event.dress_code + '</div>' +
      '<div class="event-food">' + resp.event.food + '</div>' +
      '<div class="event-drink">' + resp.event.drink + '</div>' +
      '<div class="event-price">' + resp.event.price + ' kr</div>' +
      '<div class="event-description">' + resp.event.description + '</div>'
      );
  })
  .fail(function(resp){
    console.log(resp.statusText);
  });


  $('.back').on('click', function(){
    $('.event-info').empty();
  })

  $('.event-signup-btn').on('click', function(){
    console.log('signup pressed', eventData);
    $.ajax({
      url: API + '/events/' + clickedEvent + '/event_users',
      type: 'POST',
      dataType: 'json',
      data: {
        event_user: {group_custom: 'Godtycklig grupp'}
      },
      success: function(resp) {
        alert(JSON.stringify(resp));
      },
      fail: function(resp) {
        console.log(resp.statusText);
      }
    });
  })
});

myApp.onPageBack('event', function (page) {
  $('.tabbar').show();
  $('.toolbar').show();
});
