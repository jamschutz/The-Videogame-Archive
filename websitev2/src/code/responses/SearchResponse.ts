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
            article.website = d['website'];
            article.thumbnail = d['thumbnail'];
            article.type = d['type']

            console.log(article);

            this.results.push(article);
        });
    }
}