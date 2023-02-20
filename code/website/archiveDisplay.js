const ARCHIVE_FILE_PATH = '../../archive/_fullArchive/archive.json'
const ARTICLES_DIV_ID = 'articles'
const DATE_DISPLAY_ID = 'date-display'

// parse url params
var url_string = window.location.href;
var url = new URL(url_string);

var day = url.searchParams.get("day");
var month = url.searchParams.get("month");
var year = url.searchParams.get("year");


function getArticlesOnDay(archive) {
    let empty = []
    
    if(archive.hasOwnProperty(year)){
        if(archive[year].hasOwnProperty(month)){
            if(archive[year][month].hasOwnProperty(day)){
                return archive[year][month][day]
            }
        }
    }

    return empty;
}



function showArticlesOnDay(archive) {
    let articles = getArticlesOnDay(archive);
    console.log(articles);

    // add articles to article div
    let articlesDiv = document.getElementById(ARTICLES_DIV_ID);

    if(articles.length == 0) {
        articlesDiv.innerHTML = "No articles found for this date.";
        return;
    }

    for(let i = 0; i < articles.length; i++) {
        let article = document.createElement("a");
        article.href = articles[i]['url'];
        
        let title = document.createTextNode(articles[i]['title']);
        article.appendChild(title);

        let newLine = document.createElement("br");
        articlesDiv.appendChild(article);
        articlesDiv.appendChild(newLine);
    }
}


function getArchiveData() {
    fetch(ARCHIVE_FILE_PATH)
        .then(response => response.json())
        .then((json) => {
            console.log(json)
            showArticlesOnDay(json);
        });
}


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


function goToDay(d) {
    console.log('going to day: ' + d);
    window.location.href = '/html/archive.html?year=' + year + '&month=' + month + '&day=' + d;
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
    // let dayNumber = parseInt(day);
    // let monthNumber = parseInt(month);
    // let yearNumber = parseInt(year);

    // // always safe
    // if(monthNumber > 1) {
    //     monthNumber--;
    // }
    // // roll back the year
    // else {
    //     yearNumber--;
    //     monthNumber = 12;
    // }

    // // fix day if needed
    // if(dayNumber > getMaxDayForMonth(monthNumber)) {
    //     dayNumber = getMaxDayForMonth(monthNumber);
    // }

    // let d = intToString(dayNumber);
    // let m = intToString(monthNumber);
    // let y = intToString(yearNumber);

    // updateCalendar(m, d, y);

    decrementCalendarMonth();

    // window.location.href = '/html/archive.html?year=' + y + '&month=' + m + '&day=' + d;
}


function goToNextMonth() {
    // let dayNumber = parseInt(day);
    // let monthNumber = parseInt(month);
    // let yearNumber = parseInt(year);

    // // always safe
    // if(monthNumber < 12) {
    //     monthNumber++;
    // }
    // // go to next year
    // else {
    //     yearNumber++;
    //     monthNumber = 1;
    // }

    // // fix day if needed
    // if(dayNumber > getMaxDayForMonth(monthNumber)) {
    //     dayNumber = getMaxDayForMonth(monthNumber);
    // }

    // let d = intToString(dayNumber);
    // let m = intToString(monthNumber);
    // let y = intToString(yearNumber);

    // updateCalendar(m, d, y);
    incrementCalendarMonth();

    // window.location.href = '/html/archive.html?year=' + y + '&month=' + m + '&day=' + d;
}

window.onload = function() {
    showCurrentDay();
    updateCalendar(month, day, year);
}

getArchiveData();