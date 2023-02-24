const PATH_TO_SERVER = '../_local_server/'
const GET_ARCHIVE_DATA_URL = 'http://127.0.0.1:5000/login'


// function postData(input) {
//     $.ajax({
//         type: "POST",
//         url: `/login`,
//         data: { param: input },
//         success: callbackFunc
//     });
// }

// function callbackFunc(response) {
//     // do something with the response
//     console.log('got back: ' + response);
// }

// postData('data to process');


// const ARCHIVE_FOLDER_PATH = '../data/'
// var archive = {}
var isArchiveLoaded = false;

// parse url params and set file path
var url = new URL(window.location.href);
// var ARCHIVE_FILE_PATH = ARCHIVE_FOLDER_PATH + url.searchParams.get("year") + '.json';


function getArticlesOnDay(year, month, day) {
    let empty = []
    
    // if(archive.hasOwnProperty(month)){
    //     if(archive[month].hasOwnProperty(day)){
    //         return archive[month][day]
    //     }
    // }

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
    // return isArchiveLoaded;
    return true;
}


function saveArchive(data) {
    console.log(data);
    archive = data;

    // isArchiveLoaded = true;
    
}

function getArchiveData() {
    fetch(GET_ARCHIVE_DATA_URL)
        .then(response => response.json())
        .then((json) => {
            saveArchive(json);
        });
}





getArchiveData();