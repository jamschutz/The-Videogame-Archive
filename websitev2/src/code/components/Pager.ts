import { UrlParser } from "../utils/UrlParser";

export class Pager {
    constructor() {
        
    }


    public init(totalPageCount: number) {
        let currentPage = UrlParser.getPageNumber();
        let searchTerms = UrlParser.getSearchRequest().searchTerms;
        let baseUri = `/search/?term=${encodeURIComponent(searchTerms.join(' '))}`;

        let smallestPage, largestPage;
        if(totalPageCount <= 5) {
            smallestPage = 1;
            largestPage = totalPageCount;
        }
        else if(currentPage <= 3) {
            smallestPage = 1;
            largestPage = 5;
        }
        else if((totalPageCount - currentPage) <= 2) {
            largestPage = totalPageCount;
            smallestPage = largestPage - 4;
        }
        else {
            smallestPage = currentPage - 2;
            largestPage = smallestPage + 4;
        }

        let container = document.getElementById("Pager-listContainer");
        if(container == undefined) {
            console.error('unable to find page container');
            return;
        }
        for(let page = smallestPage; page <= largestPage; page++) {
            container.appendChild(this.getPageItem(page, baseUri, page == currentPage));
        }
    }


    private getPageItem(pageNumber: number, baseUri: string, isCurrentPage: boolean): HTMLElement {
        // create list object
        let listItem = document.createElement('li');
        if(isCurrentPage) {
            listItem.id = 'Pager-currentPageItem';
        }

        // create a object
        let pageLink = document.createElement('a');
        pageLink.innerText = pageNumber.toString();
        pageLink.href = `${baseUri}&page=${pageNumber.toString()}`;

        listItem.appendChild(pageLink);
        return listItem;
    }
}

