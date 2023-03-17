class GetArticleCountResponse {
    public data : ArticleCountData[]

    constructor(jsonData: []) {
        this.data = [];
        jsonData.forEach(d => {
            this.data.push(new ArticleCountData(d));
        });
    }
}


class ArticleCountData {
    public count : number;
    public date : CalendarDate;

    constructor(data: JSON) {
        this.count = data['count'];
        this.date = CalendarDate.fromDateString(data['date']);
    }
}