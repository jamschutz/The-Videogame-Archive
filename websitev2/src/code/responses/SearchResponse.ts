import { Article } from "../entities/Article";
import { CalendarDate } from "../entities/CalendarDate";

export class SearchResponse {
    public totalResults : number;
    public results : Article[];

    constructor(jsonData: {}) {
        console.log(jsonData);
        this.totalResults = jsonData['TotalResults' as keyof {}];
        this.results = [];
        (jsonData['Results' as keyof {}] as []).forEach(d => {
            let article = new Article();
            article.date = CalendarDate.fromDateString(d['datePublished']);
            article.title = d['title'];
            article.subtitle = d['subtitle'];
            article.author = d['author'];
            article.url = d['url'];
            article.website = d['website'];
            article.thumbnail = d['thumbnail'];
            article.type = d['type']

            this.results.push(article);
        });
    }
}