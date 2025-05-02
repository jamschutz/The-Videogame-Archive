import { UrlParser } from "../utils/UrlParser";

export class SearchBar {
    constructor() {
        
    }


    static async onSubmit() {
        console.log('on submit');
        let searchBar = document.getElementById("Global-searchBar") as HTMLInputElement;
        let searchTerms = searchBar.value;
        window.location.href = `/search/?term=${encodeURIComponent(searchTerms)}`;
    }


    public init() {
        let searchBar = document.getElementById("Global-searchBar") as HTMLInputElement;
        searchBar.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {  //checks whether the pressed key is "Enter"
                SearchBar.onSubmit();
            }
            else {
                console.log(`got key: ${e.key}`);
            }
        });

        let searchBtn = document.getElementById("Global-searchBarBtn") as HTMLInputElement;
        searchBtn.addEventListener("click", () => SearchBar.onSubmit());

        let searchHistory = UrlParser.getSearchRequest();
        if(searchHistory !== null) {
            searchBar.value = searchHistory.searchTerms.join(' ');
        }
    }
}