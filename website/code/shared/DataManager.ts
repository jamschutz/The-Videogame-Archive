class DataManager {
    constructor() {
        // do nothing
    }

    async getArticlesForDayAsync(date: CalendarDate): Promise<Article[]> {
        console.log('getting articles...');
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
            article.website = Config.websiteIdToName(json[i]['website']);
            article.date = `${date.month}/${date.day}/${date.year}`;
            article.author = json[i]['author'];
            article.subtitle = json[i]['subtitle'];

            articles.push(article);
        }

        return articles;
    }

    static async getArticleCountBetweenDatesAsync(start: CalendarDate, end: CalendarDate): Promise<GetArticleCountResponse> {
        console.log('getting articles...');
        let response = await fetch(`${Config.API_BASE_URL}/ArticleCount?start=${start.toUrlString()}&end=${end.toUrlString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return new GetArticleCountResponse(await response.json());
    }


    static async getSearchResults(searchRequest: SearchRequest): Promise<Article[]> {
        console.log('getting search results...');
        let response = await fetch(`${Config.API_BASE_URL}/Search?title=${searchRequest.searchTerms.join('+')}&subtitle=${searchRequest.searchTerms.join('+')}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return new SearchResponse(await response.json()).results;
    }
}