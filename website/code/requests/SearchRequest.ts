class SearchRequest {
    public searchTerms: string[];

    constructor(searchTerms: string | string[]) {
        if(typeof searchTerms === 'string') {
            searchTerms = searchTerms.split(' ');
        }

        this.searchTerms = searchTerms;
    }
}