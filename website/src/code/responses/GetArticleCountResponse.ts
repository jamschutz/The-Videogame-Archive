import { CalendarDate } from "../entities/CalendarDate";

export class GetArticleCountResponse {
    public data : ArticleCountData[]

    constructor(jsonData: JSON) {
        this.data = [];
        for(const key in jsonData) {
            let articleCount = jsonData[key as keyof JSON] as unknown as {};
            this.data.push(new ArticleCountData(articleCount['date' as keyof {}], articleCount['count' as keyof {}]));
        }
    }
}


export class ArticleCountData {
    public count : number;
    public date : CalendarDate;

    constructor(date: string, count: number) {
        this.count = count;
        this.date = CalendarDate.fromDateString(date);
    }
}