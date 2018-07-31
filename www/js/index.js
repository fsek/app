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
    tapHold: true, // Enable tap hold events
    disableContextMenu: false // Allow the user to copy/paste text
  },
  statusbar: {
    enabled: false,
  },
  input: {

    /*
     * This function has finally been added to F7, but it works pretty bad on some
     * of our pages (like login). Therefore, this global setting must be disabled.
     *
     * F7 auto scrolling canm still be enabled on individual inputs. Just run:
     *   `app.input.scrollIntoView(inputEl, duration, centered, force)`
     * on the focus event for a specified input.
     */
    scrollIntoViewOnFocus: false
  }

  /*statusbarOverlay: false,*/
});

// Define Dom7
var $$ = Dom7;

// API URLS
const BASE_URL = 'https://stage.fsektionen.se';
const API = 'https://stage.fsektionen.se/api';
const AC_URL = 'wss://stage.fsektionen.se/cable';

// ActionCable Token URL
const AC_TOKEN_URL = API + '/messages/new_token';

// Configure jToker
$.auth.configure({
  apiUrl: API,
  storage: 'localStorage'
});

// Creating views and defining their routes
var loginView = app.views.create('#login', {
  routesAdd: [
    {
      name: 'reset_password',
      path: '/reset_password/',
      url: './reset_password.html',
      routes: [
        {
          name: 'reset_password_confirm',
          path: 'reset_password_confirm/',
          componentUrl: './reset_password_confirmation.html'
        }
      ]
    },
    {
      name: 'signup',
      path: '/signup/',
      url: './signup.html',
      routes: [
        {
          name: 'signup_confirm',
          path: 'signup_confirm/',
          componentUrl: './signup_confirmation.html'
        }
      ]
    }
  ]
});
var homeView = app.views.create('#view-home', {
  routesAdd: [
    {
      name: 'event',
      path: '/event/:eventId',
      url: './event.html',
      routes: [
        {
          name: 'contact',
          path: 'contact/:contactId',
          url: './contact.html',
        },
      ]
    },
  ]
});
var calendarView = app.views.create('#view-calendar', {
  routesAdd: [
    {
      name: 'event',
      path: '/event/:eventId',
      url: './event.html',
      routes: [
        {
          name: 'user_page',
          path: 'user_page/',
          url: './user_page.html',
        },
        {
          name: 'contact',
          path: 'contact/:contactId',
          url: './contact.html',
        },
      ]
    },
  ]
});
var messagesView = app.views.create('#view-groups', {
  routesAdd: [
    {
      name: 'messages',
      path: '/messages/:groupId/:groupName',
      url: './messages.html',
      routes: [
        {
          name: 'messages_editor',
          path: 'messages_editor/',
          url: './messages_editor.html'
        }
      ]
    },
  ]
});
var notificationsView = app.views.create('#view-notifications', {
  routesAdd: [
    {
      name: 'event',
      path: '/event/:eventId',
      url: './event.html',
      routes: [
        {
          name: 'contact',
          path: 'contact/:contactId',
          url: './contact.html',
        },
      ]
    },
  ]
});
var alternativesView = app.views.create('#view-alternatives', {
  routesAdd: [
    {
      name: 'about_app',
      path: '/about_app/',
      url: './about_app.html',
    },
    {
      name: 'about_section',
      path: '/about_section/',
      url: './about_section.html',
    },
    {
      name: 'songbook',
      path: '/songbook/',
      url: './songbook.html',
      routes: [
        {
          name: 'song',
          path: 'song/:songId',
          url: './song.html'
        }
      ]
    },
    {
      name: 'user_page',
      path: '/user_page/',
      url: './user_page.html',
    },
    {
      name: 'contact',
      path: '/contact/:contactId',
      url: './contact.html',
    },
  ]
});

// Complie templates
var templateNames = ['contactTemplate', 'dayTemplate', 'dayTitleTemplate', 'eventPageTemplate', 'groupTemplate',
  'newsTemplate', 'notificationTemplate', 'songbookTemplate', 'songTemplate'];
app.templates = compileTemplates(templateNames);

function compileTemplates(templateNames) {
  var compiledTemplates = {};
  for (var name of templateNames) {
    var template = $('script#' + name).html();
    compiledTemplates[name] = Template7.compile(template);
  }

  return compiledTemplates;
}

const infScrollPreloader = '<div class="infinite-scroll-preloader"><div class="preloader"></div></div>';

// Handle the back button on android
function onBackKey() {
  const router = app.views.current.router;
  const page = $$(router.currentPageEl);
  const pageName = page.data('name');

  const loginModal = $$('.login-screen.modal-in');

  if (loginModal.length) {
    const currentPage = loginModal.find('.page-current');

    if (currentPage.data('name') === 'login') {
      navigator.app.exitApp();
    } else {
      loginView.router.back();
    }
  } else if (pageName === 'home') {
    const activeSub = page.find('.subtab.tab-active').attr('id');

    if (activeSub !== 'subtab1') {
      app.tab.show('#subtab1');
    } else {
      navigator.app.exitApp();
    }
  } else if (pageName === 'calendar' || pageName === 'groups' || pageName === 'notifications' || pageName === 'alternatives') {
    app.tab.show('#view-home');
  } else if ($$('.popover.modal-in').length) {
    app.popover.close('.popover.modal-in');
  } else if ($$('.popup').length) {
    app.popup.close('.popup');
  } else {
    router.back();
  }
}

document.addEventListener('deviceready', function() {
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

// Default of hiding the toolbar in smart selects that open i page
$$(document).on('page:beforein', '.page.smart-select-page', function (e) {
  const page = e.detail.$el;
  page.addClass('no-toolbar');
});
