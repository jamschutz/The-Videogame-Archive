const ARCHIVE_FILE_PATH = '../../archive/_fullArchive/archive.json'
var archive = {}
var isArchiveLoaded = false;


function getArticlesOnDay(year, month, day) {
    let empty = []

    console.log('showing archie...');
    console.log(archive);
    
    if(archive.hasOwnProperty(year)){
        if(archive[year].hasOwnProperty(month)){
            if(archive[year][month].hasOwnProperty(day)){
                return archive[year][month][day]
            }
        }
    }

    return empty;
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
            // showArticlesOnDay(json);
        });
}


getArchiveData();