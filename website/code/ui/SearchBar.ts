class SearchBar {
    constructor() {
        
    }


    static async onSubmit(e: KeyboardEvent) {
        let searchTerms = (<HTMLTextAreaElement>e.target).value;
        window.location.href = `/html/searchEngine.html?search=${encodeURIComponent(searchTerms)}`;
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