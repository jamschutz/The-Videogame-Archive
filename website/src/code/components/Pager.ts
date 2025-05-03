import { UrlParser } from "../utils/UrlParser";

export class Pager {
    private container: HTMLElement | null;

    constructor() {
        this.container = document.getElementById("Pager-listContainer");
        if(this.container === null)
            console.error('unable to find page container!');
    }


    public init(totalPageCount: number) {
        let currentPage = UrlParser.getPageNumber();
        let searchTerms = UrlParser.getSearchRequest().searchTerms;
        let baseUri = `/search/`;

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

        if(this.container === null) {
            console.error('unable to find page container');
            return;
        }
        
        this.container.appendChild(this.getStartEndBtn(1, baseUri));
        for(let page = smallestPage; page <= largestPage; page++) {
            this.container.appendChild(this.getPageItem(page, baseUri, page == currentPage));
        }
        this.container.appendChild(this.getStartEndBtn(totalPageCount, baseUri));
    }


    public hide() {
        if(this.container === null)
            return;

        this.container.innerHTML = '';
    }


    private getPageItem(pageNumber: number, baseUri: string, isCurrentPage: boolean): HTMLElement {
        // create list object
        let listItem = document.createElement('li');
        if(isCurrentPage) {
            listItem.id = 'Pager-currentPageItem';
        }

        // create a object
        listItem.innerText = pageNumber.toString();
        listItem.onclick = () => {
            window.location.href = `${baseUri}?page=${pageNumber.toString()}`;
        }

        return listItem;
    }

    private getStartEndBtn(pageNumber: number, baseUri: string) {
        let listItem = document.createElement('li');
        if(pageNumber === 1) {
            listItem.innerText = '<<';
        }
        else {
            listItem.innerText = '>>';
        }

        listItem.onclick = () => {
            window.location.href = `${baseUri}&page=${pageNumber.toString()}`;
        }

        return listItem;
    }
}

