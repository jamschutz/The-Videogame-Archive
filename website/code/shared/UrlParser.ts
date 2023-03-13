class UrlParser {
    constructor() {
        // do nothing
    }


    // date should be in format YYYYMMDD
    static getDate() : CalendarDate {
        let url = new URL(window.location.href);
        let rawDate = url.searchParams.get("date");

        let year  = rawDate.substring(0,4);
        let month = rawDate.substring(4,6);
        let day   = rawDate.substring(6);
        let date = new CalendarDate(year, month, day);
        console.log(`got date: ${date.toString()}`);
        return date;
    }


    static getSearchRequest(): SearchRequest {
        let url = new URL(window.location.href);
        let searchTerms = url.searchParams.get('search');
        return new SearchRequest(searchTerms.split(','));
    }
}