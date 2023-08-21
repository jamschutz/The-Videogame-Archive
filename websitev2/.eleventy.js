const PostCSSPlugin = require("eleventy-plugin-postcss")
const { rm } = require("fs/promises")

module.exports = function(eleventyConfig) {
    // -- constants --
    const buildEnvironment = process.env.ENVIRONMENT.trim();
    const srcDir = "src"
    const dstDir = "_site"
    

    // -- assets --
    eleventyConfig.addPlugin(PostCSSPlugin);
    eleventyConfig.addPassthroughCopy('img');
    eleventyConfig.addPassthroughCopy('src/css');
    

    // watch typescript files
    eleventyConfig.addWatchTarget(`${srcDir}/code/`);


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


async function getDevArticles() {
    return new Promise(resolve => {
        const results = [
            {
                year: 2000,
                month: 10,
                day: 13,
                articles: {
                    'GameSpot': [
                        {
                            title: 'Dummy Article',
                            subtitle: 'Did it work?',
                            author: 'Joey Schutz'
                        },
                        {
                            title: 'Is it working???',
                            author: 'Ryan Erickson'
                        }
                    ],
                    'Eurogamer': [

                    ],
                    'Gameplanet': [

                    ],
                    'Indygamer': [
                        {
                            title: "LET'S GOOOOOOOOOOOOOOOOOOO",
                            author: 'Penny'
                        }

                    ],
                    'JayIsGames': [

                    ],
                    'TIGSource': [

                    ],
                }
            }            
        ];
        resolve(results);
    })
}


function compileArchiveJs()
{
    files = [
        // entities
        "entities/CalendarDate.js",
        "entities/Article.js",

        // shared
        "shared/Utils.js",
        "shared/Config.js",
        "shared/DataManager.js",
        "shared/UrlParser.js",

        // responses / requests
        "responses/GetArticleCountResponse.js",
        "responses/SearchResponse.js",
        "requests/SearchRequest.js",

        // components
        "ui/WebsiteColumn.js",
        "ui/Calendar.js",
        "ui/DateHeader.js",
        "ui/SearchBar.js",

        // main
        "archive.js"
    ];

    let compiledJs = "";
}