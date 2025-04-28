import { Website } from "../entities/Website";
import { Filter } from "../utils/Filter";

export class WebsiteColumn {
    private data: Website;

    constructor(website: Website) {
        this.data = website;
    }


    public updateHtml(filter: Filter) : void {
        // if website is not active, just bail (i.e. keep it hidden)
        if(!filter.isWebsiteActive(this.data.id))
            return;

        this.showColumn();
    }


    private showColumn() {
        // otherwise, activate website
        let websiteColumn = document.querySelector(`[data-id='${this.data.id}']`) as HTMLElement;

        if(websiteColumn != undefined)
            websiteColumn.style.display = 'block';
        else 
            console.error('could not find column for website name: ' + this.data.name);
    }
}

