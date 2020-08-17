let elkClicks = 0;
$(".egg-horn-left, .egg-horn-right, .egg-moose").on("click", () => {
    elkClicks++;
    if(elkClicks == 3) {
        $(".nollning-moose").addClass("egg-moose-rotate");
        $(".nollning-moose-scale").addClass("egg-moose-scale");

        elkClicks = 0;
    }
});

let seasonClicks = [0, 0, 0 ,0];
let voted = false;
$(".egg-season-summer").on("click", () => {
    clickSeason(0, "Tack för att du röstade på Cofös Henrik. Antal röster: " + getVotes(), "Sommaren är bäst!");
});
$(".egg-season-autumn").on("click", () => {
    clickSeason(1, "Tack för att du röstade på Cofös Saga. Antal röster: " + getVotes(), "Hösten är bäst!");
});
$(".egg-season-winter").on("click", () => {
    clickSeason(2, "Tack för att du röstade på Cofös Matlida. Antal röster: " + getVotes(), "Vintern är bäst!");
});
$(".egg-season-spring").on("click", () => {
    clickSeason(3, "Tack för att du röstade på Cofös Björn. Antal röster: " + getVotes(), "Våren är bäst!");
});

function clickSeason(index, message, title) {
    for(let i = 0; i < 4; i++) {
        if(i == index)
            continue;
        seasonClicks[i] = 0;
    }
    seasonClicks[index]++;
    if(seasonClicks[index] == 4) {
        if(voted) {
            app.dialog.alert("Du har redan röstat!", "Redan röstat!");
            return;
        }
        app.dialog.alert(message, title);
        voted = true;
    }
}

// Days from start of nollning gives 10 votes and every 10 seconds 1 vote is added
// It's probably a good enough illusion
function getVotes() {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const firstDate = new Date();
    const secondDate = new Date(2020, 07, 24, 12); // Jag tror nollningen börjar då

    const diffDays = Math.round(Math.abs((firstDate - secondDate) / oneDay));
    let singleDigit = +("" + new Date().getTime())[8]; //exploit js to the maximum, yes please
    return diffDays * 10 + singleDigit;
}