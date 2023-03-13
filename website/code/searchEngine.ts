

function showSearchResults(results: Article[]) {
    let containerDiv = document.getElementById('search-results-container');
        
    // if no articles for this day, just say so
    if(results.length === 0) {
        let noArticles = document.createElement('p');
        noArticles.innerHTML = "No articles found.";
        noArticles.classList.add('no-article-msg');

        containerDiv.appendChild(noArticles);
    }
    // otherwise, list articles
    else {
        for(let i = 0; i < results.length; i++) {
            let article = results[i];
            let articleDiv = new SearchResult(article);
            containerDiv.appendChild(articleDiv.toHtml());
        }
    }
}



// on window load
(function(window, document, undefined) {  
    window.onload = init;
  
    async function init(){
        let searchRequest = UrlParser.getSearchRequest();
        console.log('getting results for: ' + searchRequest.searchTerms);

        let results = await DataManager.getSearchResults(searchRequest);
        console.log(results);
        showSearchResults(results);
    }
})(window, document, undefined);
