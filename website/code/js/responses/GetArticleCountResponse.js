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
        var year = data['date'].split('/')[2];
        var month = data['date'].split('/')[0];
        var day = data['date'].split('/')[1];
        this.date = new CalendarDate(year, month, day);
    }
    return ArticleCountData;
}());
