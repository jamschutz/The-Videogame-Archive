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

        let year = data['date'].split('/')[2];
        let month = data['date'].split('/')[0];
        let day = data['date'].split('/')[1];
        this.date = new CalendarDate(year, month, day);
    }
}