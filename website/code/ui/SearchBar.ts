class SearchBar {
    constructor() {
        
    }


    static async onSubmit(e: KeyboardEvent) {
        let searchTerms = (<HTMLTextAreaElement>e.target).value;
        console.log('getting search results for ' + searchTerms);
        let searchRequest = new SearchRequest(searchTerms);
        let results = await DataManager.getSearchResults(searchRequest);
        console.log(results);
    }


    public init() {
        var searchBar = document.getElementById("search-bar");
        searchBar.addEventListener("keydown", function (e) {
            if (e.code === "Enter") {  //checks whether the pressed key is "Enter"
                SearchBar.onSubmit(e);
            }
        });
    }
}