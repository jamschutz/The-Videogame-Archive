// const ARCHIVE_FILE_PATH = '../../archive/_fullArchive/archive.json'
const ARTICLES_DIV_ID = 'articles'
const DATE_DISPLAY_ID = 'date-display'

const WEBSITE_COLUMN_CLASS = 'news-site-column'
const WEBSITE_COLUMN_HEADER_CLASS = 'news-site-column-header'

const SPACE_BETWEEN_COLUMNS = 400;

// parse url params
var url_string = window.location.href;
var url = new URL(url_string);

var day = url.searchParams.get("day");
var month = url.searchParams.get("month");
var year = url.searchParams.get("year");



function getWebsiteColumnDiv(website) {
    let websiteColumn = document.createElement('div');
    websiteColumn.classList.add(WEBSITE_COLUMN_CLASS)

    let label = document.createElement('span');
    label.classList.add(WEBSITE_COLUMN_HEADER_CLASS);
    label.innerHTML = website;

    let newLine1 = document.createElement("br");
    let newLine2 = document.createElement("br");

    websiteColumn.appendChild(label);
    websiteColumn.appendChild(newLine1);
    websiteColumn.appendChild(newLine2);
    
    return websiteColumn;
}



function websiteHasArticles(website, articles) {
    for(let i = 0; i < articles.length; i++) {
        if(articles[i]['website'] === website) 
            return true;
    }

    return false;
}



function showArticlesOnDay() {
    let articles = getArticlesOnDay(year, month, day);
    console.log(articles);

    // add articles to article div
    let articlesDiv = document.getElementById(ARTICLES_DIV_ID);

    if(articles.length == 0) {
        articlesDiv.innerHTML = "No articles found for this date.";
        return;
    }

    let allWebsites = getWebsites();
    for(let i = 0; i < allWebsites.length; i++) {
        let website = allWebsites[i];

        let websiteDiv = getWebsiteColumnDiv(website);
        websiteDiv.style.marginLeft = SPACE_BETWEEN_COLUMNS * i + 'px';
        

        // if no articles for this day, just say so
        if(!websiteHasArticles(website, articles)) {
            let noArticles = document.createElement('p');
            noArticles.innerHTML = "No articles found for this date.";
            noArticles.classList.add('no-article-msg');
            websiteDiv.appendChild(noArticles);
        }
        // otherwise, list articles
        else {
            for(let j = 0; j < articles.length; j++) {
                if(articles[j]['website'] != website) continue;
        
                let article = document.createElement("a");
                article.href = articles[j]['url'];
                article.classList.add('article');
                
                let title = document.createTextNode(articles[j]['title']);
                article.appendChild(title);
        
                let newLine = document.createElement("br");
                websiteDiv.appendChild(article);
                websiteDiv.appendChild(newLine);
            }
        }        

        articlesDiv.appendChild(websiteDiv);
    }

    // for(let i = 0; i < articles.length; i++) {
    //     if(articles[i]['website'] != 'GameSpot') continue;

    //     let article = document.createElement("a");
    //     article.href = articles[i]['url'];
    //     article.classList.add('article');
        
    //     let title = document.createTextNode(articles[i]['title']);
    //     article.appendChild(title);

    //     let newLine = document.createElement("br");
    //     articlesDiv.appendChild(article);
    //     articlesDiv.appendChild(newLine);
    // }
}


// function getArchiveData() {
//     fetch(ARCHIVE_FILE_PATH)
//         .then(response => response.json())
//         .then((json) => {
//             console.log(json)
//             showArticlesOnDay(json);
//         });
// }


function showCurrentDay() {
    let date = monthNumberToString(month) + ' ' + day + ', ' + year;
    document.getElementById(DATE_DISPLAY_ID).innerHTML = date;
}


function goToNextDay() {
    let dayNumber = parseInt(day);
    let monthNumber = parseInt(month);
    let yearNumber = parseInt(year);

    // always safe
    if(dayNumber < 28) {
        dayNumber++;
    }
    // not february
    else if(month !== '02' && dayNumber < 30) {
        dayNumber++;
    }
    // 31 day months
    else if(monthHas31Days(month) && dayNumber < 31) {
        dayNumber++;
    }
    else {
        dayNumber = 1;

        if(monthNumber < 12) {
            monthNumber++;
        }
        else {
            monthNumber = 1;
            yearNumber++;
        }
    }

    let d = intToString(dayNumber);
    let m = intToString(monthNumber);
    let y = intToString(yearNumber);

    window.location.href = '/html/archive.html?year=' + y + '&month=' + m + '&day=' + d;
}


function goToPreviousDay() {
    let dayNumber = parseInt(day);
    let monthNumber = parseInt(month);
    let yearNumber = parseInt(year);

    // always safe
    if(dayNumber > 1) {
        dayNumber--;
    }
    // not january
    else if(monthNumber > 1) {
        monthNumber--;
        dayNumber = getMaxDayForMonth(monthNumber);
    }
    // roll back the year
    else {
        yearNumber--;
        monthNumber = 12;
        dayNumber = 31;
    }

    let d = intToString(dayNumber);
    let m = intToString(monthNumber);
    let y = intToString(yearNumber);

    window.location.href = '/html/archive.html?year=' + y + '&month=' + m + '&day=' + d;
}


function goToDate(date) {
    console.log('going to date: ' + date);
    date = date.split('/')

    let m = date[0];
    let d = date[1];
    let y = date[2];

    window.location.href = '/html/archive.html?year=' + y + '&month=' + m + '&day=' + d;
}


function goToPreviousMonth() {
    decrementCalendarMonth();
}


function goToNextMonth() {
    incrementCalendarMonth();
}


function showArticlesOnArchiveLoad() {
    if(archiveLoaded()) {
        console.log('archive ready');
        showArticlesOnDay();
        updateCalendar(month, day, year);
    }
    else {
        console.log('waiting for archive...');
        setTimeout(showArticlesOnArchiveLoad, 0.1);
    }
}

window.onload = function() {
    showArticlesOnArchiveLoad();
    showCurrentDay();
}