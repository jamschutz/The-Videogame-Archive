import { Filter } from "../utils/Filter";
const config = require('config');

export class FilterNavBar {
    private filter: Filter;
    private websiteFilters: HTMLCollectionOf<Element> | null;
    private articleTypeFilters: HTMLCollectionOf<Element> | null;

    constructor(filter: Filter) {
        this.filter = filter;
        this.websiteFilters = document.getElementsByClassName("ArticleFilters-filterCheckboxWebsites");
        this.articleTypeFilters = document.getElementsByClassName("ArticleFilters-filterCheckboxArticleTypes");

        this.updateHtml();

        // bind apply filters button
        let applyFiltersButton = document.getElementById("ArticleFilters-applyFiltersBtn") as HTMLInputElement;
        applyFiltersButton.addEventListener("click", () => this.applyFilters());
    }


    public updateHtml(): void {
        this.updateFilterCheckboxes(this.websiteFilters, (website: string) => this.filter.isWebsiteActive(website));
        this.updateFilterCheckboxes(this.articleTypeFilters, (articleType: string) => this.filter.isArticleTypeActive(articleType));
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


    private applyFilters() {
        // update website filters
        this.updateFilters(this.websiteFilters, 
            (website: string) => this.filter.isWebsiteActive(website),
            (website: string) => this.filter.includeWebsite(website),
            (website: string) => this.filter.deleteRule(website, 'websites', true)
        );
        
        // update article type filters
        this.updateFilters(this.articleTypeFilters, 
            (articleType: string) => this.filter.isArticleTypeActive(articleType),
            (articleType: string) => this.filter.includeArticleType(articleType),
            (articleType: string) => this.filter.deleteRule(articleType, 'articleTypes', true)
        );

        this.filter.saveRules();
        window.location.reload();
    }


    private updateFilters(checkboxes: HTMLCollectionOf<Element> | null, isActiveFunc: Function, setActiveFunc: Function, setInactiveFunc: Function) : void {
        if(checkboxes === null)
            return;

        for(let i = 0; i < checkboxes.length; i++) {
            let checkbox = checkboxes.item(i) as HTMLElement;
            
            let value = checkbox.getAttribute('name');
            if(value == undefined)
                continue;
            value = value.trim();

            let isActive = (checkbox as HTMLInputElement).checked;
            if(isActive) {
                if(isActiveFunc(value)) {
                    // do nothing, already active
                }
                else {
                    setActiveFunc(value);
                }
            }
            else {
                if(isActiveFunc(value)) {
                    setInactiveFunc(value);
                }
                else {
                    // do nothing, already inactive
                }
            }
        }
    }
}