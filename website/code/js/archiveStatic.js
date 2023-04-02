let calendar = new Calendar();

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
function goToTargetDate(targetDate) {
    window.location.href = `/html/archive/${targetDate.year}/${Utils.getTwoCharNum(targetDate.month)}/${Utils.getTwoCharNum(targetDate.day)}.html`;
}

// calendar button functions
function goToNextCalendarMonth() {
    calendar.goToNextMonth();
}
function goToNextCalendarYear() {
    calendar.goToNextYear();
}
function goToPreviousCalendarMonth() {
    calendar.goToPreviousMonth();
}
function goToPreviousCalendarYear() {
    calendar.goToPreviousYear();
}

(function(window, document, undefined) {  
    window.onload = init;
  
    function init(){
        let searchBar = document.getElementById("search-bar");
        searchBar.addEventListener("keydown", function (e) {
            if (e.code === "Enter") {  //checks whether the pressed key is "Enter"
                onSearchSubmit(e);
            }
        });

        calendar.updateHtml();
    }
  
})(window, document, undefined);


function onSearchSubmit(e) {
    let searchTerms = e.target.value;
    window.location.href = `/html/searchEngine.html?search=${encodeURIComponent(searchTerms)}`;
}