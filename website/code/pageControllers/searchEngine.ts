

// on window load
(function(window, document, undefined) {  
    window.onload = init;
  
    async function init(){
        let searchRequest = UrlParser.getSearchRequest();
        console.log('getting results for: ' + searchRequest.searchTerms);

        let results = await DataManager.getSearchResults(searchRequest);
        console.log(results);
    }
  
})(window, document, undefined);
