var sentMessage = 0;
//all kod här = no gud
$(document).on('pageInit', function(e) {
    var page = e.detail.page;
    if(page.name === 'fadderchat' || page.name === 'foschat'){
        $('.page-content messages-content').append('')...
        sentMessage = 0; /*senaste meddelandet*/
        $('.send-message').on('click', function () {
            var name = 'Fredrik Lastow' /*Hämta vad användaren heter*/
            var message = $('input[name="message"]').val();
            if(sentMessage === 0){
                $('.messages').append('<div class="message message-sent message-first message-appear-from-bottom">'
                + '<div class="message-name">'
                    + name
                + '</div>'
                + '<div class="message-text">'
                    + message
                + '</div>'
                + '</div>');
                sentMessage = 1;
            }else{
                $('.messages').append('<div class="message message-sent message-appear-from-bottom">'
                + '<div class="message-name">'
                    + name
                + '</div>'
                + '<div class="message-text">'
                    + message
                + '</div>'
                + '</div>');
            }

            $('input[name="message"]').val('');
        });
    }
});

myApp.onPageBack('fadderchat', function (page) {
    $('.tabbar').show();
});

myApp.onPageInit('fadderchat', function (page) {
    $('.tabbar').hide();
});

myApp.onPageBack('foschat', function (page) {
    $('.tabbar').show();
});

myApp.onPageInit('foschat', function (page) {
    $('.tabbar').hide();
});