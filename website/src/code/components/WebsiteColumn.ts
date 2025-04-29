import { Website } from "../entities/Website";
import { Filter } from "../utils/Filter";

export class WebsiteColumn {
    private data: Website;
    private webColumn: HTMLElement | undefined;

    constructor(website: Website, order: number) {
        this.data = website;

        this.webColumn = document.getElementById(`Archive-websiteColumn${this.data.name}`) as HTMLElement;
        if(this.webColumn == undefined) {
            console.error('could not find column for website name: ' + this.data.name);
        }

        this.webColumn.style.order = order.toString();
    }


    public updateHtml(filter: Filter) : void {
        // if website is not active, just bail (i.e. keep it hidden)
        if(!filter.isWebsiteActive(this.data.id))
            return;

        this.showColumn();
        this.filterArticles(filter);
    }


    private showColumn() {
        if(this.webColumn == undefined)
            return;

        this.webColumn.style.display = 'block';
    }


    private filterArticles(filter: Filter) {
        if(this.webColumn == undefined)
            return;

        // loop over each article
        this.webColumn.querySelectorAll(`.Archive-article`).forEach(article => {
            // parse metadata
            let author = article.getAttribute('data-author');
            let articleType = article.getAttribute('data-type');

            // if anything is disabled, hide it
            if(author !== null && !filter.isAuthorActive(author))  {
                (article as HTMLElement).style.display = 'none';
            }
            if(articleType !== null && !filter.isArticleTypeActive(articleType)) {
                (article as HTMLElement).style.display = 'none';
            }
        })
    }
}

