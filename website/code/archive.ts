// const PADDING_BETWEEN_WEBSITE_COLUMNS = 500
const PADDING_BETWEEN_WEBSITE_COLUMNS = 0;
const NUM_WEBSITES = 6;

let dataManager = new DataManager();
let calendar = new Calendar();
let dateHeader = new DateHeader();
let searchBar = new SearchBar();


async function appendMagazinePOC() {
    let currentDate = UrlParser.getDate();

    let full_issue = new Article();
    full_issue.date = new CalendarDate(1993, 10, 1);
    full_issue.title = 'Edge, Issue 1';
    full_issue.subtitle = '';
    full_issue.author = null;
    full_issue.thumbnail = 'Edge_001_FullIssue_thumbnail.jpg';
    full_issue.url = `${Config.LOCAL_FILE_BASE_URL}/Edge/1993/10/Edge_001_FullIssue.pdf`;

    let articles = [];

    if(currentDate.year === 1993 && currentDate.month === 10 && currentDate.day === 1) {
        articles.push(full_issue);
        let data = await fetch("/test/Edge_1.json");
        data = await data.json();
        
        data['articles'].forEach(a => {
            let article = new Article();
            article.date = full_issue.date;
            article.title = a['title'];
            article.subtitle = a['subtitle'];
            article.author = null;
            article.thumbnail = null;
            article.url = `${Config.LOCAL_FILE_BASE_URL}/Edge/1993/10/Edge_001_p${Utils.getThreeCharNum(a["start_page"])}_${Utils.getNormalizedMagazineTitle(a["title"])}.pdf`;

            articles.push(article);
        });
    }    

    let magazineColumn = new WebsiteColumn('Edge', articles, 0);
    document.getElementById('articles').appendChild(magazineColumn.toHtml());
}


async function initPage() {
    let articles = await dataManager.getArticlesForDayAsync(UrlParser.getDate());

    let websites = {
        'GameSpot': [],
        'Eurogamer': [],
        'Gameplanet': [], 
        'JayIsGames': [],
        'TIGSource': [],
        'Indygamer': []
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

    await appendMagazinePOC();


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
    window.location.href = `/html/archive/${targetDate.year}/${targetDate.month}/${targetDate.day}.html`;
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
