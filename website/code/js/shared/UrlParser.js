var UrlParser = /** @class */ (function () {
    function UrlParser() {
        // do nothing
    }
    // date should be in format YYYYMMDD
    UrlParser.getDate = function () {
        var url = new URL(window.location.href);
        var rawDate = url.searchParams.get("date");
        if (rawDate === null) {
            // parse instead from url: http://SOME_PATH/archive/2003/10/13.html
            var urlParts = window.location.href.split('/');
            var year_1 = urlParts[urlParts.length - 3];
            var month_1 = urlParts[urlParts.length - 2];
            var day_1 = urlParts[urlParts.length - 1].split('.')[0];
            return new CalendarDate(year_1, month_1, day_1);
        }
        var year = rawDate.substring(0, 4);
        var month = rawDate.substring(4, 6);
        var day = rawDate.substring(6);
        var date = new CalendarDate(year, month, day);
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
