const PostCSSPlugin = require("eleventy-plugin-postcss")
const { rm } = require("fs/promises")
const fs = require('fs');
const pg = require('pg');
const { POSTGRES_CONNECTION_STRING } = require("./buildTools/secrets");

module.exports = function (eleventyConfig) {
    // -- constants --
    const BUILD_ENVIRONMENT = process.env.ENVIRONMENT.trim();
    const TARGET_YEAR = BUILD_ENVIRONMENT == 'prod' ? process.env.YEAR : null;
    const srcDir = "src"
    const dstDir = BUILD_ENVIRONMENT == 'dev' ? '_site' : (process.env.OS.trim() == 'windows' ? '_site' : '/srv/www');


    // -- assets --
    eleventyConfig.addPlugin(PostCSSPlugin);
    eleventyConfig.addPassthroughCopy('img');

    // -- environment data --
    eleventyConfig.addGlobalData('environment', BUILD_ENVIRONMENT);

    // -- collections --
    eleventyConfig.addCollection("websites", async () => 
        getData('GetWebsites')
    );
    eleventyConfig.addCollection("articleTypes", async () => 
        getData('GetArticleTypes')
    );
    eleventyConfig.addCollection("authors", async () => 
        getAuthors()
    );

    // ---- handle article injection ---- //
    switch(BUILD_ENVIRONMENT) {
        case "dev":
            console.log("DEV BUILD");
            eleventyConfig.addCollection("articleArchives", async () => 
                getDevArticles(dstDir)
            );
            break;

        case "prod":
            console.log("PROD BUILD");
            eleventyConfig.addCollection("articleArchives", async () => 
                getProdArticles(TARGET_YEAR, dstDir)
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


    return {
        dir: {
            input: srcDir,
            output: dstDir
        }
    };
}


async function getData(apiEndpoint) {
    let response = await fetch(`http://localhost:5000/${apiEndpoint}`);
    let data = await response.json();
    return data;
}
async function getAuthors() {
    let authors = await getData('GetAuthors');
    for(let i = 0; i < authors.length; i++) {
        // taken from: https://stackoverflow.com/questions/18749591/encode-html-entities-in-javascript
        authors[i].name = authors[i].name.replace(/[\u00A0-\u9999<>\&]/g, i => '&#'+i.charCodeAt(0)+';');
    }
    return authors;
}



// Month in JavaScript is 0-indexed (January is 0, February is 1, etc), 
// but by using 0 as the day it will give us the last day of the prior
// month. So passing in 1 as the month number will return the last day
// of January, not February
function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}
async function getArticlesForDate(year, month, websites) {
    console.log(`getting articles for ${month}/${year}...`);
    let dateNum = year * 10000 + month * 100;

    let articleResponse = await fetch(`http://localhost:5000/GetArticles?date=${dateNum + 1}&endDate=${dateNum + 31}`);
    let articles = await articleResponse.json();

    let monthResults = []
    for (let day = 1; day <= daysInMonth(month, year); day++) {
        monthResults.push({
            'year': year,
            'month': month,
            'day': day,
            'articles': getArticlesStub(websites)
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


async function getProdArticles(targetYear, dstDir) {
    // get websites...
    let websites = await getWebsites();

    // the earliest date we have for now is 05/1996
    // TODO: pull this dynamically from the database
    let startMonth = targetYear == 1996 ? 5 : 1;
    // note that getMonth is zero-based, so add 1 to it
    let endMonth = targetYear == new Date().getFullYear() ? new Date().getMonth() + 1 : 12;

    let results = [];
    for (let month = startMonth; month <= endMonth; month++) {
        let articles = await getArticlesForDate(targetYear, month, websites);
        results.push(...articles);
    }

    await createDbDataJson(dstDir);
    return results;
}


async function getDevArticles(dstDir) {
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
    for (let date = 20071013; date <= 20071020; date++) {
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
    
    await createDbDataJson(dstDir);
    return articles;
}


function getArticlesStub(websites) {
    // build something like this:
    // {
    //     'GameSpot': [],
    //     ...
    //     "Rock Paper Shotgun": []
    // }
    let stub = {};
    for(website of websites) {
        stub[website.name] = [];
    }
    return stub;
}


async function createDbDataJson(dstDir) {
    let websites = await getData('GetWebsites');
    let articleTypes = await getData('GetArticleTypes');
    let authors = await getData('GetAuthors');
    let dbData = {
        'websites': websites,
        'articleTypes': articleTypes,
        'authors': authors
    }

    // make sure data dir exists
    fs.mkdir(`${dstDir}/data`, { recursive: true }, (err) => {
        if (err) throw err;
    });

    fs.writeFile(`${dstDir}/data/dbData.json`, JSON.stringify(dbData), function(err) {
        if(err) {
            return console.error(err);
        }
        console.log("db data saved");
    }); 
}