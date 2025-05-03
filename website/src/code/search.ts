import { SearchBar } from "./components/SearchBar";
import { Pager } from "./components/Pager";
import { Article } from "./entities/Article";
import { SearchResult } from "./components/SearchResult";
import { SearchRequest } from "./requests/SearchRequest";
import { UrlParser } from "./utils/UrlParser";
import { DataManager } from "./utils/DataManager";
import { FilterComponent } from "./components/FilterComponent";
import { Filter } from "./utils/Filter";

let se_searchBar = new SearchBar(onSubmit);
let se_pager = new Pager();
let se_dataManager = new DataManager();

let se_filterSettings = new Filter(false);  // false means don't load from cache
let se_filterNavBar; // wait to initialize until webpage has loaded

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
    if(progressBar == undefined) {
        console.error('unable to find progress bar on page...')
    }
    else {
        progressBar.style.display = 'none';
    }
    
    let containerDiv = document.getElementById('Search-resultsContainer');
    if(containerDiv == undefined) {
        console.error('unable to find search results container...bailing');
        return;
    }
        
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


async function onSubmit(searchTerms: string) {
    console.log('getting results for: ' + searchTerms);

    let startTime = Date.now();
    let req = new SearchRequest(searchTerms, 1);
    let results = await DataManager.getSearchResults(req, se_filterSettings);
    console.log(results); 

    let calculationTime = (Date.now() - startTime) / 1000; // milliseconds to seconds
    let searchResultTimer = document.getElementById('Search-resultCount');
    if(searchResultTimer == undefined) {
        console.error('unable to find Search-resultCount');
    }
    else {
        searchResultTimer.innerText = `${results.totalResults} results (${calculationTime.toFixed(2)} seconds)`;
    }
    
    showSearchResults(results.results);

    // build pager
    se_pager.init(Math.ceil(results.totalResults / 25));
}



// on window load
(function(window, document, undefined) {  
    window.onload = init;
  
    async function init(){
        se_searchBar.init();

        await se_dataManager.loadData();
        await se_filterSettings.loadData();
        se_filterSettings.includeAllWebsites();
        se_filterSettings.includeAllArticleTypes();
        se_filterNavBar = new FilterComponent(se_filterSettings);

        // if didn't search for anything
        // if(searchRequest.isEmpty()) {
            // hide progress bar
            let progressBar = document.getElementById('Search-progressBar');
            if(progressBar == undefined) {
                console.error('unable to find progress bar');
            }
            else {
                progressBar.style.display = 'none';
            }
            
            let containerDiv = document.getElementById('Search-resultsContainer');

            // and bail
            return;
        // }
    }
})(window, document, undefined);
