const PostCSSPlugin = require("eleventy-plugin-postcss")
const { rm } = require("fs/promises")
const fs = require('fs');
const pg = require('pg');
const { POSTGRES_CONNECTION_STRING } = require("./buildTools/secrets");

module.exports = function(eleventyConfig) {
    // -- constants --
    const buildEnvironment = process.env.ENVIRONMENT.trim();
    const srcDir = "src"
    const dstDir = "_site"
    

    // -- assets --
    eleventyConfig.addPlugin(PostCSSPlugin);
    eleventyConfig.addPassthroughCopy('img');

    // ---- handle article injection ---- //
    switch(buildEnvironment) {
        case "dev":
            // handle dev...
            console.log("DEV BUILD");
            eleventyConfig.addCollection("articleArchives", async () => 
                getDevArticles()
            );
            break;
        case "test":
            // handle test...
            console.log("TEST BUILD");
            break;
        case "prod":
            // handle prod...
            console.log("PROD BUILD");
            eleventyConfig.addCollection("articleArchives", async () => 
                getProdArticles()
            );
            break;
        default:
            // do something else..?
            console.log("NO ENVIRONMENT SPECIFIED");
            break;
    }

    
    // -- build --
    // remove the _collections dir from the site output
    eleventyConfig.on("eleventy.after", async () => {
        await rm(`${dstDir}/_collections`, { recursive: true, force: true })
    })
    
    // update dates with articles -- don't await
    updateDatesWithArticles(buildEnvironment, dstDir);


    return {
        dir: {
            input: srcDir,
            output: dstDir
        }
    };
}


async function updateDatesWithArticles(environment, dstDir) {
    let apiBaseUrl = "";
    switch(environment) {
        case "dev":
            apiBaseUrl = "http://127.0.0.1:7070/api";
            break;
        case "test":
            apiBaseUrl = "http://127.0.0.1:7070/api";
            break;
        case "prod":
            apiBaseUrl = "http://127.0.0.1:7070/api";
            break;
        default:
            console.log("NO ENVIRONMENT SPECIFIED -- updateDatesWithArticles");
            break;
    }

    console.log('getting dates with articles...');
    let today = getTodaysString();
    let response = await fetch(`${apiBaseUrl}/DatesWithArticles?start=1&end=${today}`);

    let datesWithArticles = await response.json();
    if (!fs.existsSync(`${dstDir}/data`)){
        fs.mkdirSync(`${dstDir}/data`);
    }

    // create write stream
    var writeStream = fs.createWriteStream(`${dstDir}/data/datesWithArticles.json`);

    // and write out the articles
    writeStream.write(`[${datesWithArticles.join(',')}]`);

    // the finish event is emitted when all data has been flushed from the stream
    writeStream.on('finish', () => {
        console.log(`wrote all the array dates with articles`);
    });

    // handle the errors on the write process
    writeStream.on('error', (err) => {
        console.error(`There is an error writing dates with articles => ${err}`)
    });

    // close the stream
    writeStream.end();
}

function getTodaysString() {
    let today = new Date()
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    return `${yyyy}${mm}${dd}`;
}



// Month in JavaScript is 0-indexed (January is 0, February is 1, etc), 
// but by using 0 as the day it will give us the last day of the prior
// month. So passing in 1 as the month number will return the last day
// of January, not February
function daysInMonth (month, year) {
    return new Date(year, month, 0).getDate();
}
function getArticlesForDate(year, month) {
    console.log(`getting articles for ${month}/${year}...`);

    let websites = ["GameSpot", "Eurogamer", "Gameplanet", "JayIsGames", "TIGSource", "Indygamer"];
    let dateFileNumber = year * 10000 + month * 100;

    let data = fs.readFileSync(`${__dirname}\\buildTools\\articlesByDate\\${dateFileNumber}.json`, 'utf8');
    let articles = JSON.parse(data);

    let monthResults = []
    for(let day = 1; day <= daysInMonth(month, year); day++) {
        monthResults.push({
            'year': year,
            'month': month,
            'day': day,
            'articles': {
                'GameSpot': [],
                'Eurogamer': [],
                'Gameplanet': [],
                'JayIsGames': [],
                'TIGSource': [],
                'Indygamer': []
            }
        });
    }

    articles.forEach(article => {
        let dayPublished = article['datePublished'].toString().substring(6);
        let articleInfo = {
            'title': article['title'],
            'subtitle': article['subtitle'],
            'author': article['author'],
            'thumbnail': article['thumbnail'],
            'url': article['url'],
            'type': article['articleType']
        };
        
        let articleWebsite = article['website'];
        monthResults[dayPublished - 1]['articles'][articleWebsite].push(articleInfo);
    });

    return monthResults;
}


async function getProdArticles() {
    return new Promise(resolve => {
        let startMonth = 5;
        let startYear = 1996;
        let endMonth = 12;
        let endYear = 2015;

        let month = startMonth;
        let year = startYear;

        console.log('getting prod articles....');    
        let results = [];
        while(year <= endYear) {
            let maxMonth = year === endYear? endMonth : 12;
            while(month <= maxMonth) {
                let articles = getArticlesForDate(year, month);
                articles.forEach(a => {
                    results.push(a);
                });
                month++;
            }
            
            month = 1;
            year++;
        }
        resolve(results);
    });
}


async function getDevArticles() {
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
            'day': 13 + (date - 20071013),
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

    return articles;
}