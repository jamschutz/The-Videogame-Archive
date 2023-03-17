// const PADDING_BETWEEN_WEBSITE_COLUMNS = 500
const PADDING_BETWEEN_WEBSITE_COLUMNS = 0;
const NUM_WEBSITES = 5;

let dataManager = new DataManager();
let calendar = new Calendar();
let dateHeader = new DateHeader();
let searchBar = new SearchBar();


async function initPage() {
    let articles = await dataManager.getArticlesForDayAsync(UrlParser.getDate());

    let websites = {
        'GameSpot': [],
        'Eurogamer': [],
        'Gameplanet': [], 
        'JayIsGames': [],
        'TIGSource': []
    };

    for(let i = 0; i < articles.length; i++) {
        websites[articles[i].website].push(articles[i]);
    }

    let articlesDiv = document.getElementById('articles');
    for(let i = 0; i < NUM_WEBSITES; i++) {
        let websiteName = Config.websiteIdToName(i + 1);
        let paddingLeft = PADDING_BETWEEN_WEBSITE_COLUMNS * i;
        let websiteArticles = websites[websiteName];

        let websiteColumn = new WebsiteColumn(websiteName, websiteArticles, paddingLeft);
        articlesDiv.appendChild(websiteColumn.toHtml());
    }
}

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
    window.location.href = `/html/archive.html?date=${targetDate.year}${Utils.getTwoCharNum(targetDate.month)}${Utils.getTwoCharNum(targetDate.day)}`;
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


initPage();

// on window load
(function(window, document, undefined) {  
    window.onload = init;
  
    function init(){
        dateHeader.updateHtml();
        calendar.updateHtml();
        searchBar.init();
    }
  
})(window, document, undefined);
