myApp.onPageInit('achievements', function(page){
  var achievements = [
    {
      name: 'spodermon',
      points: '10000', 
      image: '../img/achievements-spindelman.png'
    },
    {
      name: 'flying',
      points: '1337',
      image: '../img/f_logo.png' 
    },
    {
      name: 'Slå Jessica i magen',
      points: '9999999999999',
      image: '../img/missing_thumb.png' 
    }
  ]
  var templateHTML = myApp.templates.achievementTemplate({kalle:achievements});
  console.log(templateHTML)
  $('#achievement-list').html(templateHTML)
});

var achievementpages = [
  {
    title: 'spodermon',
    text: 'här är spodermontexten Slå Jessica i magen Slå Jessica i magen Slå Jessica i magen Slå Jessica i magen Slå Jessica i magen Slå Jessica i magen Slå Jessica i magen Slå Jessica i magen Slå Jessica i magen Slå Jessica i magen Slå Jessica i magen Slå Jessica i magen Slå Jessica i magen Slå Jessica i magen'
  }
]

myApp.onPageInit('achievementpage', function (page) {

    var templateHTML = myApp.templates.achievementpageTemplate({kallepage:achievementpages});
    var songContent = $('.achievementpage-content');
    songContent.html(templateHTML);
  
});