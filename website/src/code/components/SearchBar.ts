import { UrlParser } from "../utils/UrlParser";

type OnSubmitHandler = (searchRequest: string) => void;
export class SearchBar {
    private onSubmitCallback: OnSubmitHandler;

    constructor(submitSearch: OnSubmitHandler) {
        this.onSubmitCallback = submitSearch;
    }


    private onSubmit() {
        console.log('on submit');
        let searchBar = document.getElementById("Global-searchBar") as HTMLInputElement;
        this.onSubmitCallback(searchBar.value);
        // window.location.href = `/search/?term=${encodeURIComponent(searchTerms)}`;
    }


    public init() {
        let searchBar = document.getElementById("Global-searchBar") as HTMLInputElement;
        searchBar.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {  //checks whether the pressed key is "Enter"
                this.onSubmit();
            }
            else {
                console.log(`got key: ${e.key}`);
            }
        }, true);

        let searchBtn = document.getElementById("Global-searchBarBtn") as HTMLInputElement;
        if(searchBtn !== null)
            searchBtn.addEventListener("click", () => this.onSubmit());

        let searchHistory = UrlParser.getSearchRequest();
        if(searchHistory !== null) {
            searchBar.value = searchHistory.searchTerms.join(' ');
        }
    }
}