const PostCSSPlugin = require("eleventy-plugin-postcss")
const EleventyFetch = require("@11ty/eleventy-fetch");
const { rm } = require("fs/promises")
const fs = require('fs');

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
            apiBaseUrl = "";
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

    writeStream.write(`[${datesWithArticles.join(',')}]`);
    
    // write each value of the array on the file breaking line
    // datesWithArticles.forEach(value => writeStream.write(`${value},`));
    // writeStream.write(']');

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


async function getDevArticles() {
    return new Promise(resolve => {
        const results = [
            {
                "year": 2000,
                "month": 10,
                "day": 10,
                "articles": {
                    "GameSpot": [
                        {
                            "title": "Siege of Avalon Chapter 2 Available",
                            "subtitle": "Digital Tome announces the release of the next chapter in the episodic role-playing game. New screenshots inside.",
                            "author": "Trey Walker",
                            "thumbnail": "10_siege-of-avalon-chapter-2-available_1100-2638619_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/siege-of-avalon-chapter-2-available/1100-2638619/",
                            "type": "news"
                        },
                        {
                            "title": "Zeus: Master of Olympus Gold",
                            "subtitle": "Impressions Games announces that its upcoming city-building game is complete and will soon ship to retail stores. Screenshots inside.",
                            "author": "Trey Walker",
                            "thumbnail": "10_zeus-master-of-olympus-gold_1100-2638624_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/zeus-master-of-olympus-gold/1100-2638624/",
                            "type": "news"
                        },
                        {
                            "title": "Shenmue Hands-On",
                            "subtitle": "We played through the latest build of the English version of Shenmue - with the entire game already translated and practically ready for its November 14 ship date - to bring you complete details on the game's localization.",
                            "author": "Shahed Ahmed",
                            "thumbnail": "10_shenmue-hands-on_1100-2638897_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/shenmue-hands-on/1100-2638897/",
                            "type": "news"
                        },
                        {
                            "title": "Longest Journey Shipping Soon",
                            "subtitle": "The US version of Funcom's critically acclaimed adventure game will soon be on its way to stores.",
                            "author": "Trey Walker",
                            "thumbnail": "10_longest-journey-shipping-soon_1100-2638947_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/longest-journey-shipping-soon/1100-2638947/",
                            "type": "news"
                        },
                        {
                            "title": "No Escape Impressions",
                            "subtitle": "Funcom shows off its upcoming third-person shooter. New screenshots inside.",
                            "author": "Andrew Park",
                            "thumbnail": "10_no-escape-impressions_1100-2638610_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/no-escape-impressions/1100-2638610/",
                            "type": "news"
                        },
                        {
                            "title": "Spyro: Year of the Dragon Glides Into Stores",
                            "subtitle": "The third installment of Spyro for the PlayStation has shipped to retailers.",
                            "author": "Doug Trueman",
                            "thumbnail": "10_spyro-year-of-the-dragon-glides-into-stores_1100-2638769_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/spyro-year-of-the-dragon-glides-into-stores/1100-2638769/",
                            "type": "news"
                        },
                        {
                            "title": "Western Digital to Develop Xbox Hard-Drive",
                            "subtitle": "Microsoft finally has a partner for Xbox hard-drive development.",
                            "author": "Shahed Ahmed",
                            "thumbnail": "10_western-digital-to-develop-xbox-hard-drive_1100-2638852_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/western-digital-to-develop-xbox-hard-drive/1100-2638852/",
                            "type": "news"
                        },
                        {
                            "title": "THQ and Nickelodeon to Cocreate Kids Games",
                            "subtitle": "SpongeBob SquarePants and Rocket Power licensed by THQ.",
                            "author": "Doug Trueman",
                            "thumbnail": "10_thq-and-nickelodeon-to-cocreate-kids-games_1100-2638774_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/thq-and-nickelodeon-to-cocreate-kids-games/1100-2638774/",
                            "type": "news"
                        },
                        {
                            "title": "Blob Light from Nyko",
                            "subtitle": "The peripheral's company announces a new Game Boy Color accesory.",
                            "author": "Gamespot Staff",
                            "thumbnail": "10_blob-light-from-nyko_1100-2638940_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/blob-light-from-nyko/1100-2638940/",
                            "type": "news"
                        },
                        {
                            "title": "TimeSplitters T-Shirt Promotion",
                            "subtitle": "Eidos to give away TimeSplitters t-shirts. Find out how to get one for yourself.",
                            "author": "Gamespot Staff",
                            "thumbnail": "10_timesplitters-t-shirt-promotion_1100-2638938_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/timesplitters-t-shirt-promotion/1100-2638938/",
                            "type": "news"
                        },
                        {
                            "title": "Capcom Confirms Three for Dreamcast",
                            "subtitle": "Capcom confirms that its triple-threat in survival horror, Dino Crisis, Resident Evil 2, and Resident Evil 3: Nemesis are headed to the North American Dremacast.",
                            "author": "Shahed Ahmed",
                            "thumbnail": "10_capcom-confirms-three-for-dreamcast_1100-2638944_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/capcom-confirms-three-for-dreamcast/1100-2638944/",
                            "type": "news"
                        },
                        {
                            "title": "Infogrames and Hudson Deal",
                            "subtitle": "Infogrames and Hudson announce a tie-up to develop and publish next-generation products.",
                            "author": "Shahed Ahmed",
                            "thumbnail": "10_infogrames-and-hudson-deal_1100-2638943_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/infogrames-and-hudson-deal/1100-2638943/",
                            "type": "news"
                        },
                        {
                            "title": "Summoner Ready to Ship",
                            "subtitle": "THQ's RPG is ready for the PlayStation 2 launch.",
                            "author": "Gamespot Staff",
                            "thumbnail": "10_summoner-ready-to-ship_1100-2638948_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/summoner-ready-to-ship/1100-2638948/",
                            "type": "news"
                        },
                        {
                            "title": "EVO Goes Gold",
                            "subtitle": "The Dreamcast's 4x4 Evolution is ready to ship.",
                            "author": "Gamespot Staff",
                            "thumbnail": "10_evo-goes-gold_1100-2638953_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/evo-goes-gold/1100-2638953/",
                            "type": "news"
                        },
                        {
                            "title": "Verant Q&A",
                            "subtitle": "We speak to Verant's John Smedley about the recent EverQuest fan fiction controversy.",
                            "author": "Sam Parker",
                            "thumbnail": "10_verant-qanda_1100-2638977_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/verant-qanda/1100-2638977/",
                            "type": "news"
                        }
                    ],
                    "Eurogamer": [
                        {
                            "title": "The Tech",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "10_article-29422_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29422",
                            "type": "news"
                        },
                        {
                            "title": "The Views",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "10_article-29423_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29423",
                            "type": "news"
                        },
                        {
                            "title": "Championship Manager in the news",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "10_article-29420_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29420",
                            "type": "news"
                        },
                        {
                            "title": "Gameplay and SCi go digital",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "10_article-29419_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29419",
                            "type": "news"
                        },
                        {
                            "title": "One thousand Quakers invade Newbury race course",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "10_article-29418_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29418",
                            "type": "news"
                        },
                        {
                            "title": "Latest Mattel release information",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "10_article-29417_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29417",
                            "type": "news"
                        },
                        {
                            "title": "Homeworld Cataclysm",
                            "subtitle": "",
                            "author": "Ben",
                            "thumbnail": "10_r-hwc_thumbnail.png",
                            "url": "https://www.eurogamer.net/r-hwc",
                            "type": "review"
                        },
                        {
                            "title": "Stars grab their balls",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "10_article-29416_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29416",
                            "type": "news"
                        }
                    ],
                    "Gameplanet": [],
                    "Indygamer": [],
                    "JayIsGames": [],
                    "TIGSource": []
                }
            },
            {
                "year": 2000,
                "month": 10,
                "day": 11,
                "articles": {
                    "GameSpot": [
                        {
                            "title": "Hawk on Top",
                            "subtitle": "Tony Hawk's Pro Skater 2 claims the top spot in total console game sales.",
                            "author": "Gamespot Staff",
                            "thumbnail": "11_hawk-on-top_1100-2636938_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/hawk-on-top/1100-2636938/",
                            "type": "news"
                        },
                        {
                            "title": "The Outforce Preview",
                            "subtitle": "Can The Outforce compete with more technologically-advanced real-time strategy games?",
                            "author": "Scott Osborne",
                            "thumbnail": "11_the-outforce-preview_1100-2638908_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/the-outforce-preview/1100-2638908/",
                            "type": "news"
                        },
                        {
                            "title": "First Look: ESPN NBA 2Night PS2",
                            "subtitle": "Get the first glimpse at ESPN NBA 2Night for the PlayStation 2.",
                            "author": "Shahed Ahmed",
                            "thumbnail": "11_first-look-espn-nba-2night-ps2_1100-2639368_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/first-look-espn-nba-2night-ps2/1100-2639368/",
                            "type": "news"
                        },
                        {
                            "title": "Q&A: Ted Price of Insomniac Games",
                            "subtitle": "We spoke with the president of Insomniac Games about Spyro: Year of the Dragon, the origins of the Spyro franchise, the company's next-generation plans, and more.",
                            "author": "Shahed Ahmed",
                            "thumbnail": "11_qanda-ted-price-of-insomniac-games_1100-2638866_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/qanda-ted-price-of-insomniac-games/1100-2638866/",
                            "type": "news"
                        },
                        {
                            "title": "EA Close to Securing Rings",
                            "subtitle": "Electronic Arts is close to wrapping up the licensing deal for the Lord of the Rings movie franchise.",
                            "author": "Gamespot Staff",
                            "thumbnail": "11_ea-close-to-securing-rings_1100-2639447_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/ea-close-to-securing-rings/1100-2639447/",
                            "type": "news"
                        },
                        {
                            "title": "Golden TWINE",
                            "subtitle": "The PlayStation version of The World is Not Enough is ready to ship.",
                            "author": "Gamespot Staff",
                            "thumbnail": "11_golden-twine_1100-2639448_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/golden-twine/1100-2639448/",
                            "type": "news"
                        },
                        {
                            "title": "Midnight Club Soundtrack Set",
                            "subtitle": "Rockstar reveals the contributors to the soundtrack for its PS2 racing game Midnight Club.",
                            "author": "Shahed Ahmed",
                            "thumbnail": "11_midnight-club-soundtrack-set_1100-2639449_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/midnight-club-soundtrack-set/1100-2639449/",
                            "type": "news"
                        },
                        {
                            "title": "THPS 2 Still at One",
                            "subtitle": "Tony Hawk 2 stays ahead of NFL 2K1 on the overall game sales chart for the second week in a row.",
                            "author": "Gamespot Staff",
                            "thumbnail": "11_thps-2-still-at-one_1100-2639457_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/thps-2-still-at-one/1100-2639457/",
                            "type": "news"
                        },
                        {
                            "title": "New Media: Last Blade 2",
                            "subtitle": "Take a look at the first video of Last Blade 2 for the Sega Dreamcast.",
                            "author": "Gamespot Staff",
                            "thumbnail": "11_new-media-last-blade-2_1100-2639459_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/new-media-last-blade-2/1100-2639459/",
                            "type": "news"
                        },
                        {
                            "title": "Infogrames Testing New Packaging",
                            "subtitle": "The WizardWorks division will begin a trial run of a new, smaller box design.",
                            "author": "Trey Walker",
                            "thumbnail": "11_infogrames-testing-new-packaging_1100-2639479_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/infogrames-testing-new-packaging/1100-2639479/",
                            "type": "news"
                        },
                        {
                            "title": "Unfinished Business Finds Publisher",
                            "subtitle": "Interplay will publish the stand-alone expansion to 1999's turn-based strategy game Jagged Alliance 2. Screenshots inside.",
                            "author": "Trey Walker",
                            "thumbnail": "11_unfinished-business-finds-publisher_1100-2639475_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/unfinished-business-finds-publisher/1100-2639475/",
                            "type": "news"
                        },
                        {
                            "title": "Baldur's Gate 2 Takes Second... and Seventh",
                            "subtitle": "Interplay's role-playing giant is big enough for two slots in PC Data's top-selling games list.",
                            "author": "Trey Walker",
                            "thumbnail": "11_baldurs-gate-2-takes-second-and-seventh_1100-2639473_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/baldurs-gate-2-takes-second-and-seventh/1100-2639473/",
                            "type": "news"
                        }
                    ],
                    "Eurogamer": [
                        {
                            "title": "The Tech",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "11_article-29430_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29430",
                            "type": "news"
                        },
                        {
                            "title": "The Views",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "11_article-29431_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29431",
                            "type": "news"
                        },
                        {
                            "title": "Eye Candy",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "11_article-29432_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29432",
                            "type": "news"
                        },
                        {
                            "title": "You're in the army now",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "11_article-29429_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29429",
                            "type": "news"
                        },
                        {
                            "title": "Less severing for Germans",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "11_article-29428_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29428",
                            "type": "news"
                        },
                        {
                            "title": "Carving out your own Kingdom in Shadowbane",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "11_article-29427_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29427",
                            "type": "news"
                        },
                        {
                            "title": "Odyssey - The Search for Ulysses",
                            "subtitle": "",
                            "author": "DNM",
                            "thumbnail": "11_r-odyssey-pc_thumbnail.png",
                            "url": "https://www.eurogamer.net/r-odyssey-pc",
                            "type": "review"
                        },
                        {
                            "title": "Latest Virgin release information",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "11_article-29426_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29426",
                            "type": "news"
                        },
                        {
                            "title": "Original War",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "11_p-originalwar_thumbnail.png",
                            "url": "https://www.eurogamer.net/p-originalwar",
                            "type": "preview"
                        },
                        {
                            "title": "The PS2's Launch Line-up Shortens",
                            "subtitle": "",
                            "author": "Tom Bramwell",
                            "thumbnail": "11_article-29425_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29425",
                            "type": "news"
                        },
                        {
                            "title": "Western Digital confirmed for Xbox",
                            "subtitle": "",
                            "author": "Tom Bramwell",
                            "thumbnail": "11_article-29424_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29424",
                            "type": "news"
                        },
                        {
                            "title": "3dfx unveils VoodooTV range",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "11_article-29421_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29421",
                            "type": "news"
                        }
                    ],
                    "Gameplanet": [],
                    "Indygamer": [],
                    "JayIsGames": [],
                    "TIGSource": []
                }
            },
            {
                "year": 2000,
                "month": 10,
                "day": 12,
                "articles": {
                    "GameSpot": [
                        {
                            "title": "Eternal Eyes First Impression",
                            "subtitle": "Sunsoft has delivered new screens for its upcoming PlayStation RPG, currently titled Mappet Monster (a new name for the title should be coming soon).",
                            "author": "Gamespot Staff",
                            "thumbnail": "12_eternal-eyes-first-impression_1100-2547443_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/eternal-eyes-first-impression/1100-2547443/",
                            "type": "news"
                        },
                        {
                            "title": "Aibo 2 Unveiled",
                            "subtitle": "Sony reveals a second robotic pet and this time its a mechanical cat.",
                            "author": "Shahed Ahmed",
                            "thumbnail": "12_aibo-2-unveiled_1100-2640126_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/aibo-2-unveiled/1100-2640126/",
                            "type": "news"
                        },
                        {
                            "title": "Eternal Eyes Preview",
                            "subtitle": "Eternal Eyes mixes a structured RPG plot, sweepingly artistic character designs, and Pok&#233;mon-style monster gathering with classic strategy-RPG action.",
                            "author": "Frank Provo",
                            "thumbnail": "12_eternal-eyes-preview_1100-2640023_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/eternal-eyes-preview/1100-2640023/",
                            "type": "news"
                        },
                        {
                            "title": "3D Realms Comments on Xbox Duke",
                            "subtitle": "Duke isn't quite ready to make his appearance on Microsoft's console.",
                            "author": "Shahed Ahmed",
                            "thumbnail": "12_3d-realms-comments-on-xbox-duke_1100-2640124_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/3d-realms-comments-on-xbox-duke/1100-2640124/",
                            "type": "news"
                        },
                        {
                            "title": "Hasbro May Consider Sale of Electronic Game Division",
                            "subtitle": "Hasbro Interactive announces that it is exploring strategic alternatives after reporting low earnings.",
                            "author": "Trey Walker",
                            "thumbnail": "12_hasbro-may-consider-sale-of-electronic-game-division_1100-2639952_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/hasbro-may-consider-sale-of-electronic-game-division/1100-2639952/",
                            "type": "news"
                        },
                        {
                            "title": "All-in-One PS2",
                            "subtitle": "Sony expects to accomplish greater things with the PS2 than just gaming.",
                            "author": "Gamespot Staff",
                            "thumbnail": "12_all-in-one-ps2_1100-2640118_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/all-in-one-ps2/1100-2640118/",
                            "type": "news"
                        },
                        {
                            "title": "Exclusive Golem Screenshots",
                            "subtitle": "Longsoft Games sends us a group of exclusive screenshots from its upcoming postapocalyptic strategy game.",
                            "author": "Trey Walker",
                            "thumbnail": "12_exclusive-golem-screenshots_1100-2639958_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/exclusive-golem-screenshots/1100-2639958/",
                            "type": "news"
                        },
                        {
                            "title": "Spyro: The Year of the Dragon Preview",
                            "subtitle": "Sony's miniature purple dragon is back for one last world-saving jaunt on your PlayStation.",
                            "author": "Ben Stahl",
                            "thumbnail": "12_spyro-the-year-of-the-dragon-preview_1100-2593914_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/spyro-the-year-of-the-dragon-preview/1100-2593914/",
                            "type": "news"
                        },
                        {
                            "title": "New Battle Isle: The Andosia War Screenshots",
                            "subtitle": "Blue Byte releases new shots from its upcoming turn-based strategy game.",
                            "author": "Giancarlo Varanini",
                            "thumbnail": "12_new-battle-isle-the-andosia-war-screenshots_1100-2640155_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/new-battle-isle-the-andosia-war-screenshots/1100-2640155/",
                            "type": "news"
                        },
                        {
                            "title": "Carnivores: Ice Age Screens",
                            "subtitle": "WizardWorks releases a group of screenshots from its upcoming prehistoric hunting game.",
                            "author": "Trey Walker",
                            "thumbnail": "12_carnivores-ice-age-screens_1100-2640153_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/carnivores-ice-age-screens/1100-2640153/",
                            "type": "news"
                        },
                        {
                            "title": "SWAT 3: Elite Edition Ships",
                            "subtitle": "Sierra announces that its latest squad-based action game will soon be available in stores. Exclusive screenshots inside.",
                            "author": "Craig Beers",
                            "thumbnail": "12_swat-3-elite-edition-ships_1100-2640112_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/swat-3-elite-edition-ships/1100-2640112/",
                            "type": "news"
                        },
                        {
                            "title": "New IL-2 Sturmovik Movie",
                            "subtitle": "Get a glimpse of this World War II flight simulator in action.",
                            "author": "Giancarlo Varanini",
                            "thumbnail": "12_new-il-2-sturmovik-movie_1100-2640152_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/new-il-2-sturmovik-movie/1100-2640152/",
                            "type": "news"
                        }
                    ],
                    "Eurogamer": [
                        {
                            "title": "The Views",
                            "subtitle": "",
                            "author": "Tom Bramwell",
                            "thumbnail": "12_article-29445_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29445",
                            "type": "news"
                        },
                        {
                            "title": "Eye Candy",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "12_article-29452_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29452",
                            "type": "news"
                        },
                        {
                            "title": "The Tech",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "12_article-29453_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29453",
                            "type": "news"
                        },
                        {
                            "title": "The Who's Who of Console FPS",
                            "subtitle": "",
                            "author": "Tom Bramwell",
                            "thumbnail": "12_article-29437_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29437",
                            "type": "news"
                        },
                        {
                            "title": "Siege of Avalon : Chapter Two",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "12_article-29436_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29436",
                            "type": "news"
                        },
                        {
                            "title": "'I was only obeying orders'",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "12_article-29434_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29434",
                            "type": "news"
                        },
                        {
                            "title": "Hokey religions and ancient weapons...",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "12_article-29433_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29433",
                            "type": "news"
                        }
                    ],
                    "Gameplanet": [],
                    "Indygamer": [],
                    "JayIsGames": [],
                    "TIGSource": []
                }
            },
            {
                "year": 2000,
                "month": 10,
                "day": 13,
                "articles": {
                    "GameSpot": [
                        {
                            "title": "Loopy Landscapes First Screens",
                            "subtitle": "We have some of the first images from Hasbro's new expansion to RollerCoaster Tycoon.",
                            "author": "Sam Parker",
                            "thumbnail": "13_loopy-landscapes-first-screens_1100-2619900_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/loopy-landscapes-first-screens/1100-2619900/",
                            "type": "news"
                        },
                        {
                            "title": "New Battle Isle: DarkSpace Shots",
                            "subtitle": "Blue Byte releases new screenshots from its online-only game.",
                            "author": "Giancarlo Varanini",
                            "thumbnail": "13_new-battle-isle-darkspace-shots_1100-2640447_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/new-battle-isle-darkspace-shots/1100-2640447/",
                            "type": "news"
                        },
                        {
                            "title": "Red Alert 2 First Impressions",
                            "subtitle": "Take a look at Red Alert 2, the latest installment in Westwood's  strategy series. New screenshots inside.",
                            "author": "Gamespot Staff",
                            "thumbnail": "13_red-alert-2-first-impressions_1100-2640456_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/red-alert-2-first-impressions/1100-2640456/",
                            "type": "news"
                        },
                        {
                            "title": "First Look: Kuriku-remix",
                            "subtitle": "Take a closer look at From Software's first attempt at the puzzle genre.",
                            "author": "Yukiyoshi Ike Sato",
                            "thumbnail": "13_first-look-kuriku-remix_1100-2640422_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/first-look-kuriku-remix/1100-2640422/",
                            "type": "news"
                        },
                        {
                            "title": "New Media: F1 World Grand Prix 2000",
                            "subtitle": "Eidos releases screens showing the current state of its ambitious Formula 1 game, which is being developed by Eutechnyx. Details inside.",
                            "author": "Axel Strohm",
                            "thumbnail": "13_new-media-f1-world-grand-prix-2000_1100-2640465_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/new-media-f1-world-grand-prix-2000/1100-2640465/",
                            "type": "news"
                        },
                        {
                            "title": "New Shots From Dragon's Lair 3D",
                            "subtitle": "New images from Dirk the Daring's first adventure in a fully 3D world.",
                            "author": "Giancarlo Varanini",
                            "thumbnail": "13_new-shots-from-dragons-lair-3d_1100-2640426_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/new-shots-from-dragons-lair-3d/1100-2640426/",
                            "type": "news"
                        },
                        {
                            "title": "Sega of Europe Bundles DC with DVD player",
                            "subtitle": "In a clever move, Sega of Europe is bundling a DVD player with the DC in order to compete against the DVD-enabled PS2 this holiday season.",
                            "author": "Axel Strohm",
                            "thumbnail": "13_sega-of-europe-bundles-dc-with-dvd-player_1100-2640463_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/sega-of-europe-bundles-dc-with-dvd-player/1100-2640463/",
                            "type": "news"
                        },
                        {
                            "title": "First Look: King's Field IV",
                            "subtitle": "From Software's fourth entry in the King's Field series makes its way to the PlayStation 2.",
                            "author": "Yukiyoshi Ike Sato",
                            "thumbnail": "13_first-look-kings-field-iv_1100-2640418_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/first-look-kings-field-iv/1100-2640418/",
                            "type": "news"
                        },
                        {
                            "title": "Macross M3 Preview",
                            "subtitle": "Macross M3, a 3D shooting game based on the popular anime series Macross, is being developed for the Dreamcast.  Our preview tells all.",
                            "author": "Gamespot Staff",
                            "thumbnail": "13_macross-m3-preview_1100-2640602_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/macross-m3-preview/1100-2640602/",
                            "type": "news"
                        },
                        {
                            "title": "Indianapolis Law Goes Into Effect",
                            "subtitle": "The law banning \"violent\" arcade games goes into effect.",
                            "author": "Shahed Ahmed",
                            "thumbnail": "13_indianapolis-law-goes-into-effect_1100-2640639_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/indianapolis-law-goes-into-effect/1100-2640639/",
                            "type": "news"
                        },
                        {
                            "title": "THQ Secures Tetris Rights",
                            "subtitle": "THQ will be publishing the next-generation Tetris games.",
                            "author": "Shahed Ahmed",
                            "thumbnail": "13_thq-secures-tetris-rights_1100-2640433_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/thq-secures-tetris-rights/1100-2640433/",
                            "type": "news"
                        },
                        {
                            "title": "THQ Denies Wrestling on PS2",
                            "subtitle": "The company discusses the PS2 fate of Smackdown! 2.",
                            "author": "Ben Stahl",
                            "thumbnail": "13_thq-denies-wrestling-on-ps2_1100-2640635_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/thq-denies-wrestling-on-ps2/1100-2640635/",
                            "type": "news"
                        },
                        {
                            "title": "Starfleet Command II Impressions",
                            "subtitle": "Interplay gives us an early look at the space naval combat game's new campaign system, the metaverse.",
                            "author": "Sam Parker",
                            "thumbnail": "13_starfleet-command-ii-impressions_1100-2639966_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/starfleet-command-ii-impressions/1100-2639966/",
                            "type": "news"
                        },
                        {
                            "title": "Red Alert 2 Collector's Edition Announced",
                            "subtitle": "Westwood releases a limited edition of its latest strategy game.",
                            "author": "Trey Walker",
                            "thumbnail": "13_red-alert-2-collectors-edition-announced_1100-2640634_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/red-alert-2-collectors-edition-announced/1100-2640634/",
                            "type": "news"
                        },
                        {
                            "title": "World's Largest Computer Game Tournament",
                            "subtitle": "Intel, Microsoft, and Gateway join forces to reward the best players.",
                            "author": "Jennifer Ho",
                            "thumbnail": "13_worlds-largest-computer-game-tournament_1100-2640618_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/worlds-largest-computer-game-tournament/1100-2640618/",
                            "type": "news"
                        },
                        {
                            "title": "First Impressions4x4 Evolution",
                            "subtitle": "We take a brief look at the final version of Terminal Reality's racer.",
                            "author": "Giancarlo Varanini",
                            "thumbnail": "13_first-impressions4x4-evolution_1100-2640600_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/first-impressions4x4-evolution/1100-2640600/",
                            "type": "news"
                        },
                        {
                            "title": "Evil Dead: Hail to the King",
                            "subtitle": "THQ's survival-horror game for the PC is shaping up nicely.",
                            "author": "Amer Ajami",
                            "thumbnail": "13_evil-dead-hail-to-the-king_1100-2640657_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/evil-dead-hail-to-the-king/1100-2640657/",
                            "type": "news"
                        },
                        {
                            "title": "Indianapolis Law Goes Into Effect",
                            "subtitle": "The city law banning \"violent\" arcade games goes into force, after a federal judge refuses to grant an injunction against it.",
                            "author": "Shahed Ahmed",
                            "thumbnail": "13_indianapolis-law-goes-into-effect_1100-2640646_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/indianapolis-law-goes-into-effect/1100-2640646/",
                            "type": "news"
                        },
                        {
                            "title": "Xbox Legends Announced",
                            "subtitle": "THQ has secured the rights to publish New Legends for the Xbox console.",
                            "author": "Shahed Ahmed",
                            "thumbnail": "13_xbox-legends-announced_1100-2640413_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/xbox-legends-announced/1100-2640413/",
                            "type": "news"
                        },
                        {
                            "title": "No New Legends for PC",
                            "subtitle": "Infinite Machine's third-person action game will now be published for the Xbox.",
                            "author": "Amer Ajami",
                            "thumbnail": "13_no-new-legends-for-pc_1100-2640668_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/no-new-legends-for-pc/1100-2640668/",
                            "type": "news"
                        }
                    ],
                    "Eurogamer": [
                        {
                            "title": "Championship Manager demo",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "13_article-29454_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29454",
                            "type": "news"
                        },
                        {
                            "title": "Eye Candy",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "13_article-29455_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29455",
                            "type": "news"
                        },
                        {
                            "title": "The Tech",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "13_article-29456_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29456",
                            "type": "news"
                        },
                        {
                            "title": "The Views",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "13_article-29457_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29457",
                            "type": "news"
                        },
                        {
                            "title": "Rik Heywood and Vince Farquharson of Synaptic Soup",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "13_i-synaptic_thumbnail.png",
                            "url": "https://www.eurogamer.net/i-synaptic",
                            "type": "interview"
                        },
                        {
                            "title": "Baldur's Gate II : Shadows of Amn",
                            "subtitle": "",
                            "author": "Talith",
                            "thumbnail": "13_r-baldurs2_thumbnail.png",
                            "url": "https://www.eurogamer.net/r-baldurs2",
                            "type": "review"
                        },
                        {
                            "title": "Rayman is revolting ..",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "13_article-29450_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29450",
                            "type": "news"
                        },
                        {
                            "title": "PC Releases",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "13_article-29449_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29449",
                            "type": "news"
                        },
                        {
                            "title": "Extreme!",
                            "subtitle": "",
                            "author": "Tom Bramwell",
                            "thumbnail": "13_article-29446_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29446",
                            "type": "news"
                        },
                        {
                            "title": "DVDreamcast",
                            "subtitle": "",
                            "author": "Tom Bramwell",
                            "thumbnail": "13_article-29443_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29443",
                            "type": "news"
                        },
                        {
                            "title": "Infogrames attempt to tot up their turnover",
                            "subtitle": "",
                            "author": "Tom Bramwell",
                            "thumbnail": "13_article-29442_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29442",
                            "type": "news"
                        },
                        {
                            "title": "Console Releases",
                            "subtitle": "",
                            "author": "Tom Bramwell",
                            "thumbnail": "13_article-29441_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29441",
                            "type": "news"
                        },
                        {
                            "title": "Latest THQ release dates",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "13_article-29440_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29440",
                            "type": "news"
                        },
                        {
                            "title": "Latest Ubisoft release dates",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "13_article-29439_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29439",
                            "type": "news"
                        }
                    ],
                    "Gameplanet": [],
                    "Indygamer": [],
                    "JayIsGames": [],
                    "TIGSource": []
                }
            },
            {
                "year": 2000,
                "month": 10,
                "day": 14,
                "articles": {
                    "GameSpot": [],
                    "Eurogamer": [
                        {
                            "title": "The Tech",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "14_article-29462_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29462",
                            "type": "news"
                        },
                        {
                            "title": "Eye Candy",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "14_article-29463_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29463",
                            "type": "news"
                        },
                        {
                            "title": "Mod News",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "14_article-29464_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29464",
                            "type": "news"
                        },
                        {
                            "title": "Raining death and destruction",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "14_article-29461_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29461",
                            "type": "news"
                        },
                        {
                            "title": "Something for the weekend?",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "14_article-29460_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29460",
                            "type": "news"
                        },
                        {
                            "title": "Star Trek Voyager : Elite Force",
                            "subtitle": "",
                            "author": "Tom Bramwell",
                            "thumbnail": "14_r-eliteforce-pc_thumbnail.png",
                            "url": "https://www.eurogamer.net/r-eliteforce-pc",
                            "type": "review"
                        },
                        {
                            "title": "Latest EON Digital release dates",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "14_article-29459_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29459",
                            "type": "news"
                        },
                        {
                            "title": "Latest Fox Interactive release dates",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "14_article-29458_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29458",
                            "type": "news"
                        }
                    ],
                    "Gameplanet": [],
                    "Indygamer": [],
                    "JayIsGames": [],
                    "TIGSource": []
                }
            },
            {
                "year": 2000,
                "month": 10,
                "day": 15,
                "articles": {
                    "GameSpot": [],
                    "Eurogamer": [
                        {
                            "title": "The Tech",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "15_article-29479_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29479",
                            "type": "news"
                        },
                        {
                            "title": "Eye Candy",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "15_article-29480_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29480",
                            "type": "news"
                        },
                        {
                            "title": "The Views",
                            "subtitle": "",
                            "author": "Tom Bramwell",
                            "thumbnail": "15_article-29476_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29476",
                            "type": "news"
                        },
                        {
                            "title": "Star Trek Deep Space 9 : The Fallen",
                            "subtitle": "",
                            "author": "Kefka",
                            "thumbnail": "15_p-ds9fallenho_thumbnail.png",
                            "url": "https://www.eurogamer.net/p-ds9fallenho",
                            "type": "preview"
                        },
                        {
                            "title": "Dinner with Anne McCaffrey",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "15_article-29471_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29471",
                            "type": "news"
                        },
                        {
                            "title": "Introducing the bug busting hit squad",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "15_article-29470_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29470",
                            "type": "news"
                        },
                        {
                            "title": "Hollow Victory for Asheron's Call players",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "15_article-29468_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29468",
                            "type": "news"
                        },
                        {
                            "title": "Midtown USA",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "15_article-29465_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29465",
                            "type": "news"
                        }
                    ],
                    "Gameplanet": [],
                    "Indygamer": [],
                    "JayIsGames": [],
                    "TIGSource": []
                }
            },
            {
                "year": 2000,
                "month": 10,
                "day": 16,
                "articles": {
                    "GameSpot": [
                        {
                            "title": "Star Trek Away Team Screens",
                            "subtitle": "Activision releases five new screenshots from its upcoming squad-based tactical combat game.",
                            "author": "Trey Walker",
                            "thumbnail": "16_star-trek-away-team-screens_1100-2640650_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/star-trek-away-team-screens/1100-2640650/",
                            "type": "news"
                        },
                        {
                            "title": "New Seraphim Screens",
                            "subtitle": "Valkyrie Studios has released a bunch of screenshots from its upcoming third-person action game.",
                            "author": "Trey Walker",
                            "thumbnail": "16_new-seraphim-screens_1100-2640952_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/new-seraphim-screens/1100-2640952/",
                            "type": "news"
                        },
                        {
                            "title": "Blitz: Disc Arena Screens",
                            "subtitle": "Southend releases eight new screenshots from its upcoming team-based first-person action game.",
                            "author": "Trey Walker",
                            "thumbnail": "16_blitz-disc-arena-screens_1100-2640997_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/blitz-disc-arena-screens/1100-2640997/",
                            "type": "news"
                        },
                        {
                            "title": "Anno 1503 Battle System",
                            "subtitle": "Sunflowers sends us an update on its upcoming strategy game. New screenshots inside.",
                            "author": "Trey Walker",
                            "thumbnail": "16_anno-1503-battle-system_1100-2641011_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/anno-1503-battle-system/1100-2641011/",
                            "type": "news"
                        },
                        {
                            "title": "Gundam Battle Assault Preview",
                            "subtitle": "Overall, Gundam: Battle Assault is still in the early localization stages, and it remains to be seen if some of the original features will be touched up.",
                            "author": "Gamespot Staff",
                            "thumbnail": "16_gundam-battle-assault-preview_1100-2640996_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/gundam-battle-assault-preview/1100-2640996/",
                            "type": "news"
                        },
                        {
                            "title": "Icewind Dale: Heart of Winter Q&A",
                            "subtitle": "We spoke with Black Isle Studios' Josh Sawyer to find out what the development team has in store for the official expansion to Icewind Dale.",
                            "author": "Gamespot Staff",
                            "thumbnail": "16_icewind-dale-heart-of-winter-qanda_1100-2640420_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/icewind-dale-heart-of-winter-qanda/1100-2640420/",
                            "type": "news"
                        },
                        {
                            "title": "SegaNet at Limp Bizkit Concerts",
                            "subtitle": "Sega.com announces its sponsorship of the upcoming Limp Bizkit concert tour and details several perks that its planning for concert-goers.",
                            "author": "Gamespot Staff",
                            "thumbnail": "16_seganet-at-limp-bizkit-concerts_1100-2640988_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/seganet-at-limp-bizkit-concerts/1100-2640988/",
                            "type": "news"
                        },
                        {
                            "title": "Virtual Technology in GameCube Chip",
                            "subtitle": "Sunnyvale, Ca-based Virtual Silicon Technology is providing components for the GameCube's ATI  chip.",
                            "author": "Gamespot Staff",
                            "thumbnail": "16_virtual-technology-in-gamecube-chip_1100-2641010_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/virtual-technology-in-gamecube-chip/1100-2641010/",
                            "type": "news"
                        },
                        {
                            "title": "Summoner Update",
                            "subtitle": "THQ showed the latest version of Summoner at its Las Vegas event - new screens inside.",
                            "author": "Elliott Chin",
                            "thumbnail": "16_summoner-update_1100-2640652_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/summoner-update/1100-2640652/",
                            "type": "news"
                        },
                        {
                            "title": "Hoshigami Delayed Again",
                            "subtitle": "Max Five's PlayStation strategy simulation game gets pushed back.",
                            "author": "Yukiyoshi Ike Sato",
                            "thumbnail": "16_hoshigami-delayed-again_1100-2640896_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/hoshigami-delayed-again/1100-2640896/",
                            "type": "news"
                        },
                        {
                            "title": "Q&A: Pyro Studios",
                            "subtitle": "Our European correspondent tracked down Pyro Studios in sunny Spain to find out more about the upcoming console versions of Commandos 2.",
                            "author": "Axel Strohm",
                            "thumbnail": "16_qanda-pyro-studios_1100-2640914_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/qanda-pyro-studios/1100-2640914/",
                            "type": "news"
                        },
                        {
                            "title": "Links 2001 Goes Gold",
                            "subtitle": "The newest iteration of the golf game is a significant upgrade in the series.",
                            "author": "Jennifer Ho",
                            "thumbnail": "16_links-2001-goes-gold_1100-2641038_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/links-2001-goes-gold/1100-2641038/",
                            "type": "news"
                        },
                        {
                            "title": "Retailers Land Sega Marine Fishing",
                            "subtitle": "The sequel to last year's Sega Bass Fishing is now on store shelves.",
                            "author": "Doug Trueman",
                            "thumbnail": "16_retailers-land-sega-marine-fishing_1100-2640984_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/retailers-land-sega-marine-fishing/1100-2640984/",
                            "type": "news"
                        },
                        {
                            "title": "Duke Nukem: Land of the Babes for PlayStation Ships",
                            "subtitle": "\"Hail to the king, baby\" heard in retail stores nationwide.",
                            "author": "Doug Trueman",
                            "thumbnail": "16_duke-nukem-land-of-the-babes-for-playstation-ships_1100-2640986_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/duke-nukem-land-of-the-babes-for-playstation-ships/1100-2640986/",
                            "type": "news"
                        },
                        {
                            "title": "More Episodic Game Announcements",
                            "subtitle": "Web Corp., the first publisher to focus on episodic game distribution, announces the games in its debut lineup.",
                            "author": "Sam Parker",
                            "thumbnail": "16_more-episodic-game-announcements_1100-2640959_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/more-episodic-game-announcements/1100-2640959/",
                            "type": "news"
                        },
                        {
                            "title": "SAS Sells SouthPeak",
                            "subtitle": "SouthPeak Interactive has been sold to an undisclosed buyer by its parent company SAS Institute.",
                            "author": "Shahed Ahmed",
                            "thumbnail": "16_sas-sells-southpeak_1100-2641016_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/sas-sells-southpeak/1100-2641016/",
                            "type": "news"
                        },
                        {
                            "title": "SAS Sells SouthPeak",
                            "subtitle": "SouthPeak Interactive has been sold to an undisclosed buyer by its parent company, SAS Institute.",
                            "author": "Shahed Ahmed",
                            "thumbnail": "16_sas-sells-southpeak_1100-2640987_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/sas-sells-southpeak/1100-2640987/",
                            "type": "news"
                        },
                        {
                            "title": "PS2 Games Arrive Early",
                            "subtitle": "Several launch games for Sony's next-generation console are already available at select retailers.",
                            "author": "Shahed Ahmed",
                            "thumbnail": "16_ps2-games-arrive-early_1100-2640925_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/ps2-games-arrive-early/1100-2640925/",
                            "type": "news"
                        },
                        {
                            "title": "Where to Find a PS2 at Launch?",
                            "subtitle": "The shortage of PS2 consoles has caused a panic among retailers and consumers alike, but there are a few places that you might find Sony's next-generation console on launch day.",
                            "author": "Shahed Ahmed",
                            "thumbnail": "16_where-to-find-a-ps2-at-launch_1100-2637887_thumbnail.jpg",
                            "url": "https://www.gamespot.com/articles/where-to-find-a-ps2-at-launch/1100-2637887/",
                            "type": "news"
                        }
                    ],
                    "Eurogamer": [
                        {
                            "title": "The Views",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "16_article-29484_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29484",
                            "type": "news"
                        },
                        {
                            "title": "Eye Candy",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "16_article-29485_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29485",
                            "type": "news"
                        },
                        {
                            "title": "The Tech",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "16_article-29486_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29486",
                            "type": "news"
                        },
                        {
                            "title": "Striving for something more",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "16_article-29483_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29483",
                            "type": "news"
                        },
                        {
                            "title": "Chapter by chapter",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "16_article-29481_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29481",
                            "type": "news"
                        },
                        {
                            "title": "Latest Codemasters release information",
                            "subtitle": "",
                            "author": "Gestalt",
                            "thumbnail": "16_article-29478_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29478",
                            "type": "news"
                        },
                        {
                            "title": "Sexbox",
                            "subtitle": "",
                            "author": "Tom Bramwell",
                            "thumbnail": "16_article-29473_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29473",
                            "type": "news"
                        },
                        {
                            "title": "Tetris Sold",
                            "subtitle": "",
                            "author": "Tom Bramwell",
                            "thumbnail": "16_article-29472_thumbnail.png",
                            "url": "https://www.eurogamer.net/article-29472",
                            "type": "news"
                        },
                        {
                            "title": "Socket A Overclocking",
                            "subtitle": "",
                            "author": "Tom Bramwell",
                            "thumbnail": "16_a-socketaoc_thumbnail.png",
                            "url": "https://www.eurogamer.net/a-socketaoc",
                            "type": "feature"
                        },
                        {
                            "title": "Tony Hawk's Pro Skater 2",
                            "subtitle": "",
                            "author": "Martin Taylor",
                            "thumbnail": "16_r-thps2-psx_thumbnail.png",
                            "url": "https://www.eurogamer.net/r-thps2-psx",
                            "type": "review"
                        }
                    ],
                    "Gameplanet": [],
                    "Indygamer": [],
                    "JayIsGames": [],
                    "TIGSource": []
                }
            }
        ];
        resolve(results);
    })
}