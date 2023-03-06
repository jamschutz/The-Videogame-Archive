class DataManager {
    constructor() {
        // do nothing
    }

    async get_articles_for_day_async(year: string, month: string, day: string) {
        console.log('getting articles...');
        let response = await fetch(`${Config.API_BASE_URL}/Articles?year=${year}&month=${month}&day=${day}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('parsing json...');
        let json = await response.json();
        console.log(json);
        console.log('parsing articles...');
        let articles = [];
        for(let i = 0; i < json.length; i++) {
            let article = new Article();
            article.title = json[i]['title'];
            article.url = json[i]['url'];
            article.website = Config.websiteIdToName(json[i]['website']);
            article.date = `${month}/${day}/${year}`;

            articles.push(article);
        }

        return articles;
    }
}