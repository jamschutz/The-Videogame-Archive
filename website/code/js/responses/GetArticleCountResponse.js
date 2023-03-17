var GetArticleCountResponse = /** @class */ (function () {
    function GetArticleCountResponse(jsonData) {
        var _this = this;
        this.data = [];
        jsonData.forEach(function (d) {
            _this.data.push(new ArticleCountData(d));
        });
    }
    return GetArticleCountResponse;
}());
var ArticleCountData = /** @class */ (function () {
    function ArticleCountData(data) {
        this.count = data['count'];
        this.date = CalendarDate.fromDateString(data['date']);
    }
    return ArticleCountData;
}());
