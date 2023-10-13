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

    static async getDatesWithArticles(): Promise<any> {
        let dates = await fetch('/data/datesWithArticles.json');
        return await dates.json();
    }


    static async getSearchResults(searchRequest: SearchRequest): Promise<Article[]> {
        let searchResultsResponse = await fetch(`${Config.API_BASE_URL}/GetSearchResults?searchTerm=${searchRequest.searchTerms.join('+')}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        let searchResults = await searchResultsResponse.json();
        let articleIds = [];
        for(var id in searchResults) {
            articleIds.push(id);
        }

        let articlesResponse = await fetch(`${Config.API_BASE_URL}/GetArticlesForIds`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(articleIds)
        });

        let results = new SearchResponse(await articlesResponse.json()).results;
        return results;
    }
}