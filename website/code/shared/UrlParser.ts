class UrlParser {
    constructor() {
        // do nothing
    }


    // date should be in format YYYYMMDD
    static getDate() : CalendarDate {
        let url = new URL(window.location.href);
        let rawDate = url.searchParams.get("date");
        if(rawDate === null) {
            // parse instead from url: http://SOME_PATH/archive/2003/10/13.html
            let urlParts = window.location.href.split('/');
            let year = urlParts[urlParts.length - 3];
            let month = urlParts[urlParts.length - 2];
            let day = urlParts[urlParts.length - 1].split('.')[0];
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
        let searchTerms = url.searchParams.get('search');
        if(searchTerms !== null) {
            return new SearchRequest(searchTerms.split(','));
        }
        else {
            return new SearchRequest('');
        }        
    }
}