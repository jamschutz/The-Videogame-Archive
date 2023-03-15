var UrlParser = /** @class */ (function () {
    function UrlParser() {
        // do nothing
    }
    // date should be in format YYYYMMDD
    UrlParser.getDate = function () {
        var url = new URL(window.location.href);
        var rawDate = url.searchParams.get("date");
        var year = rawDate.substring(0, 4);
        var month = rawDate.substring(4, 6);
        var day = rawDate.substring(6);
        var date = new CalendarDate(year, month, day);
        console.log("got date: ".concat(date.toString()));
        return date;
    };
    UrlParser.getSearchRequest = function () {
        var url = new URL(window.location.href);
        var searchTerms = url.searchParams.get('search');
        if (searchTerms !== null) {
            return new SearchRequest(searchTerms.split(','));
        }
        else {
            return new SearchRequest('');
        }
    };
    return UrlParser;
}());
