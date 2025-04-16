export class SearchRequest {
    public searchTerms: string[];
    public pageNumber: number;

    constructor(searchTerms: string | string[], page: number) {
        if(typeof searchTerms === 'string') {
            searchTerms = searchTerms.trim().split(' ');
        }

        this.searchTerms = searchTerms.filter((t) => {
            return t != null && t != ''; 
        });

        this.pageNumber = page;
    }


    public isEmpty() : boolean {
        if(this.searchTerms.length === 0)
            return true;

        if(this.searchTerms.length === 1 && this.searchTerms[0] === '')
            return true;

        return false;
    }
}