class DataManager {
    constructor() {
        // do nothing
    }

    async get_articles_for_day_async(date: CalendarDate): Promise<Article[]> {
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

    static async get_article_count_for_day_async(date: CalendarDate): Promise<number> {
        console.log('getting articles...');
        let response = await fetch(`${Config.API_BASE_URL}/ArticleCount?year=${date.year}&month=${date.month}&day=${date.day}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    }
}