let se_searchBar = new SearchBar();

function sortByDate(a: Article, b: Article) {
    if (a.date.toNumber() < b.date.toNumber()) {
      return -1;
    }
    if (a.date.toNumber() > b.date.toNumber()) {
      return 1;
    }
    return 0;
  }

function showSearchResults(results: Article[]) {
    // sort articles
    results.sort(sortByDate);

    // hide progress bar
    let progressBar = document.getElementById('Search-progressBar');
    progressBar.style.display = 'none';
    let containerDiv = document.getElementById('Search-resultsContainer');
        
    // if no articles for this day, just say so
    if(results.length === 0) {
        let noArticles = document.createElement('p');
        noArticles.innerHTML = "No articles found.";
        noArticles.classList.add('Search-noArticlesMsg');

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

        // if didn't search for anything
        if(searchRequest.isEmpty()) {
            // hide progress bar
            let progressBar = document.getElementById('Search-progressBar');
            progressBar.style.display = 'none';
            let containerDiv = document.getElementById('Search-resultsContainer');

            // and bail
            return;
        }

        console.log('getting results for: ' + searchRequest.searchTerms);

        let results = await DataManager.getSearchResults(searchRequest);
        console.log('got results');
        let calculationTime = (Date.now() - startTime) / 1000; // milliseconds to seconds
        document.getElementById('Search-resultCount').innerText = `${results.totalResults} results (${calculationTime.toFixed(2)} seconds)`;
        showSearchResults(results.results);
    }
})(window, document, undefined);
