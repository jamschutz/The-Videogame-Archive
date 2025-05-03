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

        // --- register click events --- //
        // website select buttons
        this.registerCheckboxUpdate(this.websiteFilters, 'websites');
        this.registerCheckboxUpdate(this.articleTypeFilters, 'articleTypes');

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
        
        // make sure select all checkboxes are checked... (cache will remember if they were checked last page load...)
        this.selectAllArticleTypesBtn.checked = true;
        this.selectAllArticleTypesBtn.checked = true;

        // update html to match filters
        this.updateHtml();

        // bind apply filters button
        let applyFiltersButton = document.getElementById("Filter-applyFiltersBtn") as HTMLInputElement;
        if(applyFiltersButton !== null)
            applyFiltersButton.addEventListener("click", () => this.applyFilters(true));
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


    public applyFilters(reload: boolean) : void {
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

        if(reload)
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
        let input = document.getElementById('Filter-authorInput') as HTMLInputElement;
        let author = input.value;

        // clear input
        input.value = '';

        // check for bad input
        if(!this.filter.authorExists(author)) {
            console.log(`ignoring nonexistant author: ${author}`);
            return;
        }

        if(this.filter.isAuthorActive(author)) {
            console.warn(`ignoring, already added author ${author}`);
            return;
        }
        
        let authorCard = document.createElement('div');
        authorCard.classList.add('Component-card');
        authorCard.id = `Filter-authorCard${author}`;

        let authorName = document.createTextNode(author);
        
        let closeBtn = document.createElement('span');
        closeBtn.classList.add('Component-cardCloseBtn');
        closeBtn.setAttribute('data-name', author);
        closeBtn.addEventListener('click', (e) => {
            let authorElement = e.target as HTMLElement;
            this.removeAuthor(authorElement.getAttribute('data-name'));
        });

        let container = document.getElementById('Filter-authorFilterContainer');
        authorCard.appendChild(authorName);
        authorCard.appendChild(closeBtn);
        container?.appendChild(authorCard);

        this.filter.includeAuthor(author);
    }


    public removeAuthor(author: string | null) {
        if(author === null) {
            console.error('tried to remove author, but got a null value for the author name...');
            return;
        }

        console.log(`remove: ${author}`);
        let authorCard = document.getElementById(`Filter-authorCard${author}`);
        authorCard?.remove();
        this.filter.deleteRule(author, 'authors', true);
    }


    private registerCheckboxUpdate(checkboxes: HTMLCollectionOf<Element>, category: string) : void {
        for(let i = 0; i < checkboxes.length; i++) {
            let checkbox = checkboxes.item(i) as HTMLInputElement;
            checkbox.addEventListener('click', (e) => {
                let c = e.target as HTMLInputElement;
                if(c.checked) {
                    switch(category) {
                        case 'websites':
                            this.filter.includeWebsite(c.getAttribute('name') || '');
                            break;
                        case 'articleTypes':
                            this.filter.includeArticleType(c.getAttribute('name') || '');
                            break;
                        default:
                            console.error(`unhandled category type for checkbox registration: ${category}`);
                            break;
                    }
                }
                else {
                    this.filter.deleteRule(c.getAttribute('name') || '', category, true);
                }
            });
        }
    }
}