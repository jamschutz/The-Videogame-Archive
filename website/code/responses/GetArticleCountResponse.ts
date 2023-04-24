class GetArticleCountResponse {
    public data : ArticleCountData[]

    constructor(jsonData: JSON) {
        this.data = [];
        for(const key in jsonData) {
            this.data.push(new ArticleCountData(key, jsonData[key]));
        }
    }
}


class ArticleCountData {
    public count : number;
    public date : CalendarDate;

    constructor(date: string, count: number) {
        this.count = count;
        this.date = CalendarDate.fromDateString(date);
    }
}