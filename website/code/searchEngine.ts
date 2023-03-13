let se_searchBar = new SearchBar();

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
            containerDiv.appendChild(document.createElement('hr'));
        }
    }
}



// on window load
(function(window, document, undefined) {  
    window.onload = init;
  
    async function init(){
        se_searchBar.init();

        let startTime = Date.now();
        let searchRequest = UrlParser.getSearchRequest();
        console.log('getting results for: ' + searchRequest.searchTerms);

        let results = await DataManager.getSearchResults(searchRequest);
        console.log(results);
        let calculationTime = (Date.now() - startTime) / 1000; // milliseconds to seconds
        document.getElementById('search-result-count').innerText = `${results.length} results (${calculationTime.toFixed(2)} seconds)`;
        showSearchResults(results);
    }
})(window, document, undefined);
