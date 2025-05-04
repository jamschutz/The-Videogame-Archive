import { CalendarDate } from "../entities/CalendarDate";
import { SearchRequest } from "../requests/SearchRequest";
import { UrlParamBitfield } from "./UrlParamBitfield";

export class UrlParser {
    constructor() {
        // do nothing
    }


    // date should be in format YYYYMMDD
    static getDate() : CalendarDate {
        let url = new URL(window.location.href);
        let rawDate = url.searchParams.get("date");
        if(rawDate === null) {
            // parse instead from url: http://SOME_PATH/archive/2003/10/13/index.html
            let urlParts = window.location.href.split('/');
            let year = urlParts[urlParts.length - 4];
            let month = urlParts[urlParts.length - 3];
            let day = urlParts[urlParts.length - 2].split('.')[0];
            return new CalendarDate(year, month, day);
        }

        let year  = rawDate.substring(0,4);
        let month = rawDate.substring(4,6);
        let day   = rawDate.substring(6);
        let date = new CalendarDate(year, month, day);
        return date;
    }


    static getSearchRequest(): SearchRequest {
        let url = new URL(window.location.href);
        let searchTerms = url.searchParams.get('term');
        let pageStr = url.searchParams.get('page');
        
        let pageNumber = 1;
        try {
            pageNumber = Number.parseInt(pageStr == null? '1' : pageStr);
        }
        catch {
            pageNumber = 1;
        }

        if(searchTerms !== null) {
            return new SearchRequest(searchTerms.split(' '), pageNumber);
        }
        else {
            return new SearchRequest('', pageNumber);
        }        
    }


    static getPageNumber(): number {
        let url = new URL(window.location.href);
        let page = url.searchParams.get("page");

        if(page == null)
            return 1;

        return parseInt(page);
    }


    static getActiveWebsites(): Array<number> {
        return this.getBitfieldData('w');
    }

    static getArticleFilters(): Array<number> {
        return this.getBitfieldData('a');
    }


    static reloadArchive() {
        let url = new URL(window.location.href);
        let reload = url.searchParams.get('reload');
        console.log(`reload: ${reload}`)

        return reload != null;
    }


    static getBitfieldData(param: string): Array<number> {
        let url = new URL(window.location.href);
        let bitField = url.searchParams.get(param);

        if(bitField == null) {
            return UrlParamBitfield.getAllMask();
        }

        try {
            let bitFields = [];
            for(let fields of bitField.split(',')) {
                bitFields.push(Number.parseInt(fields));
            }
            return bitFields;
        }
        catch {
            return UrlParamBitfield.getAllMask();
        }
    }
}