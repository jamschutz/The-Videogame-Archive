// --- declare components --- //
var searchBar = new SearchBar();
var calendar = new Calendar();



// -------------- main functions ---------------------- //

// buttons for the day
function goToNextDay() {
    let targetDate = UrlParser.getDate();
    targetDate.addDay();
    goToTargetDate(targetDate);
}
function goToPreviousDay() {
    let targetDate = UrlParser.getDate();
    targetDate.subtractDay();
    goToTargetDate(targetDate);
}
function goToTargetDate(targetDate: CalendarDate) {
    window.location.href = `/${targetDate.year}/${targetDate.month}/${targetDate.day}`;
}




// -------------- page init ---------------------- //
// on window load
(function(window, document, undefined) {
    window.onload = init;

    function init() {
        // init components
        searchBar.init();
        calendar.updateHtml();

        // bind forward / backward 
        let backButton = document.getElementById("Archive-articleDateBackBtn") as HTMLInputElement;
        let forwardButton = document.getElementById("Archive-articleDateForwardBtn") as HTMLInputElement;
        backButton.addEventListener("click", goToPreviousDay);
        forwardButton.addEventListener("click", goToNextDay);
    }
})(window, document, undefined)