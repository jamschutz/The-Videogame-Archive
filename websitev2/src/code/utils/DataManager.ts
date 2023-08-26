class DataManager {
    constructor() {
        // do nothing
    }

    async getArticlesForDayAsync(date: CalendarDate): Promise<Article[]> {
        let response = await fetch(`${Config.API_BASE_URL}/Articles?year=${date.year}&month=${date.month}&day=${date.day}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        let json = await response.json();

        let articles = [];
        for(let i = 0; i < json.length; i++) {
            let article = new Article();
            article.title = json[i]['title'];
            article.url = json[i]['url'];
            article.website = Utils.websiteIdToName(json[i]['website']);
            article.date = new CalendarDate(date.year, date.month, date.day);
            article.author = json[i]['author'];
            article.subtitle = json[i]['subtitle'];
            article.thumbnail = json[i]['thumbnail'];

            articles.push(article);
        }

        return articles;
    }

    static async getArticleCountBetweenDatesAsync(start: CalendarDate, end: CalendarDate): Promise<GetArticleCountResponse> {
        let response = await fetch(`${Config.API_BASE_URL}/ArticleCount?start=${start.toUrlString()}&end=${end.toUrlString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return new GetArticleCountResponse(await response.json());
    }

    static async getArticlesExistBetweenDatesAsync(start: CalendarDate, end: CalendarDate): Promise<any> {
        console.log(`fetching url: ${Config.API_BASE_URL}/ArticlesExistV2?start=${start.toUrlString()}&end=${end.toUrlString()}`)
        let response = await fetch(`${Config.API_BASE_URL}/ArticlesExistV2?start=${start.toUrlString()}&end=${end.toUrlString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    }


    // static async getSearchResults(searchRequest: SearchRequest): Promise<Article[]> {
    //     let response = await fetch(`${Config.API_BASE_URL}/Search?term=${searchRequest.searchTerms.join('+')}`, {
    //         method: 'GET',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         }
    //     });
    //     return new SearchResponse(await response.json()).results;
    // }
}