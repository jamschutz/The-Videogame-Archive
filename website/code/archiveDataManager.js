const ARCHIVE_FILE_PATH = '../data/archive.json'
var archive = {}
var isArchiveLoaded = false;


function getArticlesOnDay(year, month, day) {
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