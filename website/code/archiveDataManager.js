const ARCHIVE_FOLDER_PATH = '../data/'
var archive = {}
var isArchiveLoaded = false;

// parse url params and set file path
var url = new URL(window.location.href);
var ARCHIVE_FILE_PATH = ARCHIVE_FOLDER_PATH + url.searchParams.get("year") + '.json';


function getArticlesOnDay(year, month, day) {
    let empty = []
    
    if(archive.hasOwnProperty(month)){
        if(archive[month].hasOwnProperty(day)){
            return archive[month][day]
        }
    }

    return empty;
}


function articlesExistOnDate(year, month, day) {
    return getArticlesOnDay(year, month, day).length > 0;
}


function articlesExistOnDate(dateString) {
    dateString = dateString.split('/');
    let m = intToString(dateString[0]);
    let d = intToString(dateString[1]);
    let y = intToString(dateString[2]);

    return getArticlesOnDay(y, m, d).length > 0;
}


function archiveLoaded() {
    return isArchiveLoaded;
}


function saveArchive(data) {
    console.log(data);
    archive = data;

    isArchiveLoaded = true;
    
}

function getArchiveData() {
    fetch(ARCHIVE_FILE_PATH)
        .then(response => response.json())
        .then((json) => {
            saveArchive(json);
        });
}


getArchiveData();