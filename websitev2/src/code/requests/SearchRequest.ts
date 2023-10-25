class SearchRequest {
    public searchTerms: string[];

    constructor(searchTerms: string | string[]) {
        if(typeof searchTerms === 'string') {
            searchTerms = searchTerms.split(' ');
        }

        this.searchTerms = searchTerms;
    }


    public isEmpty() : boolean {
        if(this.searchTerms.length === 0)
            return true;

        if(this.searchTerms.length === 1 && this.searchTerms[0] === '')
            return true;

        return false;
    }
}