var isAndroid = Framework7.prototype.device.android

// Initialize app
var myApp = new Framework7({
  precompileTemplates: true,
  template7Pages: true,
  material: isAndroid ? true : false,
  tapHold: true,
  statusbarOverlay: false,
  modalButtonCancel: 'Avbryt',
  onPageInit: function (app, page) {
  	if(page.container.className.indexOf('no-tabbar') != -1){
      if($('#login').find(page.container).length === 0){
        showHideTabbar(page.name);
      }
  	}
	}
});

Template7.global = {
  android: isAndroid,
};

// Define Dom7
var $$ = Dom7;

// API URLS
const API = 'https://stage.fsektionen.se/api'
const AC_URL = 'wss://stage.fsektionen.se/cable'

// ActionCable Token URL
const AC_TOKEN_URL = API + '/messages/new_token';

// Adding views
var mainView = myApp.addView('.view-main');

var tabView1 = myApp.addView('#tab1',{
  dynamicNavbar:true
});
var tabView2 = myApp.addView('#tab2',{
  dynamicNavbar:true
});
var tabView3 = myApp.addView('#tab3',{
  dynamicNavbar:true
});
var tabView4 = myApp.addView('#tab4',{
  dynamicNavbar:true
});
var loginView = myApp.addView('#login');


// Configure jToker
$.auth.configure({
  apiUrl: API,
  storage: 'localStorage'
});

const infScrollPreloader = '<div class="infinite-scroll-preloader"><div class="preloader"></div></div>';

// Configures page so the tabbar hides and shows
function showHideTabbar(dataPage){
	myApp.onPageAfterAnimation(dataPage, function (page) {
		$('.tabbar').hide();
	});

	myApp.onPageBack(dataPage, function (page) {
		$('.tabbar').show();
	});
}

// Handle the back button on android
function onBackKey() {
  var view = myApp.getCurrentView();
  var page = view.activePage.name;

  if (page == 'tab1') {
    var activeSub =  $$('.subtab.active').attr('id');
    if (activeSub.substr(activeSub.length - 1) != 1) {
      myApp.showTab('#subtab1');
    } else {
      navigator.app.exitApp();
    }
  } else if (page == 'login') {
    navigator.app.exitApp();
  } else if (page.substr(0,3) == 'tab') {
    myApp.showTab('#tab1');
  } else if ($$('.popover, .actions-modal').length) {
    myApp.closeModal('.popover, .actions-modal');
  } else if($$('.popup').length && $$('.popup .view')[0].f7View) {
    if ($$('.popup .view')[0].f7View.history.length > 1){
      view.router.back();
    } else {
      myApp.closeModal('.popup');
    }
  } else if ($$('.popup').length) {
    myApp.closeModal('.popup');
  } else {
    view.router.back();
  }
}

document.addEventListener("deviceready", function() {
  document.addEventListener('backbutton', onBackKey, false);
}, false);

// Statusbar colors
if (myApp.device.android) {
  var loginBarColor = '#000000';
  var mainBarColor = '#000000';
} else {
  var loginBarColor = '#7999d2';
  var mainBarColor = '#eb7125';
}
