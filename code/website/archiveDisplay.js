const ARCHIVE_FILE_PATH = '../../archive/_fullArchive/archive.json'
const ARTICLES_DIV_ID = 'articles'

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

    // default to getting the body
    let articlesDiv = document.getElementById(ARTICLES_DIV_ID);

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


getArchiveData();