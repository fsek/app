myApp.onPageInit('achievements', function(page){
  var achievements = [
    {
      name: 'spodermon',
      points: '10000' 
    },
    {
      name: 'flying',
      points: '1337' 
    },
    {
      name: 'Slå Jessica i magen',
      points: '9999999999999' 
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