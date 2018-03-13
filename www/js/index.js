// Initialize app
var app = new Framework7({
  root: '#app',
  routes: [
    {
      name: 'index',
      path: '/',
      url: './index.html',
    },
  ],
  touch: {
    tapHold: true //enable tap hold events
  },
  /*statusbarOverlay: false,*/
});

// Define Dom7
var $$ = Dom7;

// API URLS
const BASE_URL = 'https://stage.fsektionen.se'
const API = 'https://stage.fsektionen.se/api'
const AC_URL = 'wss://stage.fsektionen.se/cable'

// ActionCable Token URL
const AC_TOKEN_URL = API + '/messages/new_token';

// Adding views
var mainView = app.views.create('.view-main');

var loginView = app.views.create('#login');
var homeView = app.views.create('#view-home');
var calendarView = app.views.create('#view-calendar');
var messagesView = app.views.create('#view-messages');
var notificationsView = app.views.create('#view-notifications');
var alternativesView = app.views.create('#view-alternatives');

// Complie templates
var templateNames = ['calToolbarTemplate', 'dayTemplate', 'dayTitleTemplate', 'eventPageTemplate', 'groupTemplate', 'messageTemplate', 
  'newsTemplate', 'notificationTemplate', 'songbookTemplate', 'songTemplate'];
app.templates = compileTemplates(templateNames);

function compileTemplates(templateNames){
  var compiledTemplates = {};
  for (var name of templateNames) {
    var template = $('script#' + name).html();
    compiledTemplates[name] = Template7.compile(template);
  }

  return compiledTemplates;
}

// Configure jToker
$.auth.configure({
  apiUrl: API,
  storage: 'localStorage'
});

const infScrollPreloader = '<div class="infinite-scroll-preloader"><div class="preloader"></div></div>';

// Handle the back button on android
function onBackKey() {
  var view = app.getCurrentView();
  var page = view.activePage.name;

  if (page == 'tab1') {
    var activeSub =  $$('.subtab.active').attr('id');
    if (activeSub.substr(activeSub.length - 1) != 1) {
      app.showTab('#subtab1');
    } else {
      navigator.app.exitApp();
    }
  } else if (page == 'login') {
    navigator.app.exitApp();
  } else if (page.substr(0,3) == 'tab') {
    app.showTab('#tab1');
  } else if ($$('.popover-open, .actions-modal').length) {
    app.closeModal('.popover, .actions-modal');
  } else if($$('.popup').length && $$('.popup .view')[0].f7View) {
    if ($$('.popup .view')[0].f7View.history.length > 1){
      view.router.back();
    } else {
      app.closeModal('.popup');
    }
  } else if ($$('.popup').length) {
    app.closeModal('.popup');
  } else {
    view.router.back();
  }
}

document.addEventListener("deviceready", function() {
  document.addEventListener('backbutton', onBackKey, false);
}, false);

// Statusbar colors
if (app.device.android) {
  var loginBarColor = '#000000';
  var mainBarColor = '#000000';
} else {
  var loginBarColor = '#7999d2';
  var mainBarColor = '#eb7125';
}
