const pg = require('pg');
const { POSTGRES_CONNECTION_STRING } = require("./secrets");



async function run() {
    const postgres = new pg.Client(POSTGRES_CONNECTION_STRING);
    await postgres.connect();

    let results = await postgres.query('select "Id", "Name" from "Websites"');
    let websites = results.rows;
    
    let websiteLookup = {};
    websites.forEach(website => {
        websiteLookup[website.Id] = website.Name;
    });

    

    async function getArticlesForDate(date) {
        let query = `
            select 
                "Articles"."Title", "Articles"."Subtitle",  "Writers"."Name" as "Author", "Articles"."Thumbnail", "Articles"."Url", "ArticleTypes"."Name" as "Type", "Articles"."WebsiteId"
            from "Articles"
            inner join
                "Writers"
            on
                "Articles"."AuthorId" = "Writers"."Id"
            inner join
                "ArticleTypes"
            on
                "Articles"."ArticleTypeId" = "ArticleTypes"."Id"
            where "Articles"."DatePublished" = ${date}
        `;

        let queryResults = await postgres.query(query);
        return queryResults.rows;
    }

    let articles = []
    for(let date = 20071013; date <= 20071020; date++) {
        let results = {
            'year': 2007,
            'month': 10,
            'day': date / 100,
            'articles': {}
        };

        websites.forEach(website => {
            results['articles'][website.Name] = [];
        });

        let articlesForDate = await getArticlesForDate(date);
        articlesForDate.forEach(article => {
            let website = websiteLookup[article.WebsiteId];
            results['articles'][website].push({
                "title": article.Title,
                "subtitle": article.Subtitle,
                "author": article.Author,
                "thumbnail": article.Thumbnail,
                "url": article.Url,
                "type": article.Type
            })
        });

        articles.push(results);
    }
}

run();

// postgres.connect();

// postgres.on('connect', (client) => {
//     client.query('select "Id", "Name" from "Websites"', (err, res) => {
//         if(err) 
//             throw err;

//         console.log(res);
//     });
// });