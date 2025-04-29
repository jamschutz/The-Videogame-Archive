import { Filter } from "../utils/Filter";

export class FilterNavBar {
    private filter: Filter;
    private websiteFilters: HTMLCollectionOf<Element> | null;
    private articleTypeFilters: HTMLCollectionOf<Element> | null;

    constructor(filter: Filter) {
        this.filter = filter;
        this.websiteFilters = document.getElementsByClassName("ArticleFilters-filterCheckboxWebsites");
        this.articleTypeFilters = document.getElementsByClassName("ArticleFilters-filterCheckboxArticleTypes");

        this.updateHtml();
    }


    public updateHtml(): void {
        this.updateFilterCheckboxes(this.websiteFilters, (website: string) => this.filter.isWebsiteActive(website));
        // this.updateFilterCheckboxes(this.articleTypeFilters, this.filter.isArticleTypeActive);
    }


    private updateFilterCheckboxes(checkboxes: HTMLCollectionOf<Element> | null, isActiveFunc: Function) : void {
        if(checkboxes === null)
            return;

        for(let i = 0; i < checkboxes.length; i++) {
            let checkbox = checkboxes.item(i) as HTMLElement;
            let label = checkbox.getAttribute('name');
            if(label == undefined)
                continue;
            label = label.trim();
    
            let isChecked = isActiveFunc(label);
            (checkbox as HTMLInputElement).checked = isChecked;            
        }
    }
}