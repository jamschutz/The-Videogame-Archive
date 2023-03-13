var SearchRequest = /** @class */ (function () {
    function SearchRequest(searchTerms) {
        if (typeof searchTerms === 'string') {
            searchTerms = searchTerms.split(' ');
        }
        this.searchTerms = searchTerms;
    }
    return SearchRequest;
}());
