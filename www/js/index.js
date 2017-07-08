// Initialize app
var myApp = new Framework7({
    precompileTemplates: true
});

var $$ = Dom7;

// API URL
const API = 'https://stage.fsektionen.se/api'

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

// Configure jToker
$.auth.configure({
    apiUrl: 'https://stage.fsektionen.se/api',
    storage: 'localStorage'
});

const infScrollPreloader = '<div class="infinite-scroll-preloader"><div class="preloader"></div></div>';
