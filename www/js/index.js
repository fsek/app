// Initialize app
var myApp = new Framework7({
    precompileTemplates: true,
    material: true, // True for android
    tapHold: true
});

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
    dynamicNavbar:false
});

// Configure jToker
$.auth.configure({
    apiUrl: API,
    storage: 'localStorage'
});

const infScrollPreloader = '<div class="infinite-scroll-preloader"><div class="preloader"></div></div>';
