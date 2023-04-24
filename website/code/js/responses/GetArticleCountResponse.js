var GetArticleCountResponse = /** @class */ (function () {
    function GetArticleCountResponse(jsonData) {
        this.data = [];
        for (var key in jsonData) {
            this.data.push(new ArticleCountData(key, jsonData[key]));
        }
    }
    return GetArticleCountResponse;
}());
var ArticleCountData = /** @class */ (function () {
    function ArticleCountData(date, count) {
        this.count = count;
        this.date = CalendarDate.fromDateString(date);
    }
    return ArticleCountData;
}());
