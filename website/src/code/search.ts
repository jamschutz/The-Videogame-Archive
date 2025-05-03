import { SearchBar } from "./components/SearchBar";
import { Pager } from "./components/Pager";
import { Article } from "./entities/Article";
import { SearchResult } from "./components/SearchResult";
import { SearchRequest } from "./requests/SearchRequest";
import { UrlParser } from "./utils/UrlParser";
import { DataManager } from "./utils/DataManager";
import { FilterComponent } from "./components/FilterComponent";
import { Filter } from "./utils/Filter";
import { SearchResponse } from "./responses/SearchResponse";

let se_searchBar = new SearchBar(onSubmit);
let se_pager: Pager;
let se_dataManager = new DataManager();

let se_filterSettings = new Filter(false);  // false means don't load from cache
let se_filterNavBar; // wait to initialize until webpage has loaded

let se_progressBar: HTMLElement | null;
let se_resultsContainer: HTMLElement | null;

function sortByDate(a: Article, b: Article) {
    if (a.date.toNumber() < b.date.toNumber()) {
        return -1;
    }
    if (a.date.toNumber() > b.date.toNumber()) {
        return 1;
    }
    return 0;
}

function showSearchResults(response: SearchResponse) {
    // sort articles
    response.results.sort(sortByDate);

    // hide progress bar
    if (se_progressBar == null) {
        console.error('unable to find progress bar on page...')
    }
    else {
        se_progressBar.style.display = 'none';
    }

    if (se_resultsContainer == null) {
        console.error('unable to find search results container...bailing');
        return;
    }

    // if no articles for this day, just say so
    if (response.results.length === 0) {
        let noArticles = document.createElement('p');
        noArticles.innerHTML = "No articles found.";
        noArticles.classList.add('Search-noArticlesMsg');

        se_resultsContainer.appendChild(noArticles);
    }
    // otherwise, list articles
    else {
        for (let i = 0; i < response.results.length; i++) {
            let article = response.results[i];
            let articleDiv = new SearchResult(article);
            se_resultsContainer.appendChild(articleDiv.toHtml());
            se_resultsContainer.appendChild(document.createElement('hr'));
        }

        // build pager
        se_pager.init(Math.ceil(response.totalResults / 25));
    }
}


function clearSearchResults() {
    if(se_resultsContainer === null)
        return;

    se_resultsContainer.innerHTML = '';
    se_pager.hide();
}


async function onSubmit(searchTerms: string) {
    if(se_progressBar === null)
        return;

    se_pager = new Pager();

    // make sure container div is clear
    clearSearchResults();

    // show progress bar
    se_progressBar.style.display = 'block';

    let startTime = Date.now();
    let req = new SearchRequest(searchTerms, 1);
    let results = await DataManager.getSearchResults(req, se_filterSettings);

    let calculationTime = (Date.now() - startTime) / 1000; // milliseconds to seconds
    let searchResultTimer = document.getElementById('Search-resultCount');
    if (searchResultTimer == undefined) {
        console.error('unable to find Search-resultCount');
    }
    else {
        searchResultTimer.innerText = `${results.totalResults} results (${calculationTime.toFixed(2)} seconds)`;
    }

    showSearchResults(results);
}



// on window load
(function (window, document, undefined) {
    window.onload = init;

    async function init() {
        se_searchBar.init();

        await se_dataManager.loadData();
        await se_filterSettings.loadData();
        se_filterSettings.includeAllWebsites();
        se_filterSettings.includeAllArticleTypes();
        se_filterNavBar = new FilterComponent(se_filterSettings);

        // find and store elements
        se_progressBar = document.getElementById('Search-progressBar');
        se_resultsContainer = document.getElementById('Search-resultsContainer');
    }
})(window, document, undefined);
