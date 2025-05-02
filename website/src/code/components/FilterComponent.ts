import { Filter } from "../utils/Filter";

export class FilterComponent {
    private filter: Filter;
    private websiteFilters: HTMLCollectionOf<Element> | null;
    private articleTypeFilters: HTMLCollectionOf<Element> | null;

    private selectAllWebsitesBtn: HTMLInputElement;
    private selectAllArticleTypesBtn: HTMLInputElement;

    constructor(filter: Filter) {
        // init properties
        this.filter = filter;
        this.websiteFilters = document.getElementsByClassName("Filter-filterCheckboxWebsites");
        this.articleTypeFilters = document.getElementsByClassName("Filter-filterCheckboxArticleTypes");

        // --- register select all click events --- //
        // get select all buttons
        this.selectAllWebsitesBtn = document.getElementById("Filter-websiteSelectAll") as HTMLInputElement;
        this.selectAllArticleTypesBtn = document.getElementById("Filter-articleTypeSelectAll") as HTMLInputElement;
        document.getElementById('Filter-addAuthor')?.addEventListener('click', () => this.addAuthor());

        // select all websites
        this.selectAllWebsitesBtn.addEventListener('click', () => {
            if(this.selectAllWebsitesBtn.checked)
                this.filter.includeAllWebsites();
            else
                this.filter.removeAllWebsites();

            this.updateHtml();
        });
        // select all article types
        this.selectAllArticleTypesBtn.addEventListener('click', () => {
            if(this.selectAllArticleTypesBtn.checked)
                this.filter.includeAllArticleTypes();
            else
                this.filter.removeAllArticleTypes();

            this.updateHtml();
        });

        // update html to match filters
        this.updateHtml();

        // bind apply filters button
        let applyFiltersButton = document.getElementById("Filter-applyFiltersBtn") as HTMLInputElement;
        if(applyFiltersButton !== null)
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


    public applyFilters() : void {
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
        console.log('updating filters')
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


    private addAuthor() {
        let author = document.getElementById('Filter-authorInput') as HTMLInputElement;
        console.log(author.value);
    }
}