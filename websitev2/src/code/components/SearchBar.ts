class SearchBar {
    constructor() {
        
    }


    static async onSubmit(e: KeyboardEvent) {
        let searchTerms = (<HTMLTextAreaElement>e.target).value;
        window.location.href = `/html/searchEngine.html?search=${encodeURIComponent(searchTerms)}`;
    }


    public init() {
        let searchBar = document.getElementById("Global-searchBar") as HTMLInputElement;
        searchBar.addEventListener("keydown", function (e) {
            if (e.code === "Enter") {  //checks whether the pressed key is "Enter"
                SearchBar.onSubmit(e);
            }
        });

        let searchHistory = UrlParser.getSearchRequest();
        if(searchHistory !== null) {
            searchBar.value = searchHistory.searchTerms.join(' ');
        }
    }
}


class SearchRequest {
    public searchTerms: string[];

    constructor(searchTerms: string | string[]) {
        if(typeof searchTerms === 'string') {
            searchTerms = searchTerms.split(' ');
        }

        this.searchTerms = searchTerms;
    }
}