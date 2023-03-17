var SearchResponse = /** @class */ (function () {
    function SearchResponse(jsonData) {
        var _this = this;
        this.results = [];
        jsonData.forEach(function (d) {
            var article = new Article();
            article.date = CalendarDate.fromDateString(d['date']);
            article.title = d['title'];
            article.subtitle = d['subtitle'];
            article.author = d['author'];
            article.url = d['url'];
            article.website = Config.websiteIdToName(d['website_id']);
            article.thumbnail = d['thumbnail'];
            console.log(article);
            _this.results.push(article);
        });
    }
    return SearchResponse;
}());
