const PADDING_BETWEEN_WEBSITE_COLUMNS = 450;
const NUM_WEBSITES = 4;

let dataManager = new DataManager();
let calendar = new Calendar();
let dateHeader = new DateHeader();

// parse url params
let url = new URL(window.location.href);
let day = url.searchParams.get("day");
let month = url.searchParams.get("month");
let year = url.searchParams.get("year");


async function initPage() {
    let articles = await dataManager.get_articles_for_day_async(UrlParser.getDate());
    console.log(articles);

    let websites = {
        'GameSpot': [],
        'Eurogamer': [],
        'Gameplanet': [], 
        'JayIsGames': []
    };

    for(let i = 0; i < articles.length; i++) {
        websites[articles[i].website].push(articles[i]);
    }

    let articlesDiv = document.getElementById('articles');
    for(let i = 0; i < 4; i++) {
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
    }
  
})(window, document, undefined);
