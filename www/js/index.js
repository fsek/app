// Initialize app
var myApp = new Framework7();

var $$ = Dom7;

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
