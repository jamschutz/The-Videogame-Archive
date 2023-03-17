class SearchResponse {
    public results : Article[]

    constructor(jsonData: []) {
        this.results = [];
        jsonData.forEach(d => {
            let article = new Article();
            article.date = CalendarDate.fromDateString(d['date']);
            article.title = d['title'];
            article.subtitle = d['subtitle'];
            article.author = d['author'];
            article.url = d['url'];
            article.website = Config.websiteIdToName(d['website_id']);
            article.thumbnail = d['thumbnail'];

            console.log(article);

            this.results.push(article);
        });
    }
}