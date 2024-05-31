class SearchRequest {
    public searchTerms: string[];

    constructor(searchTerms: string | string[]) {
        if(typeof searchTerms === 'string') {
            searchTerms = searchTerms.trim().split(' ');
        }

        this.searchTerms = searchTerms.filter((t) => {
            return t != null && t != ''; 
        });
    }


    public isEmpty() : boolean {
        if(this.searchTerms.length === 0)
            return true;

        if(this.searchTerms.length === 1 && this.searchTerms[0] === '')
            return true;

        return false;
    }
}