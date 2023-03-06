// export {}

let dataManager = new DataManager();

// parse url params
let url = new URL(window.location.href);
let day = url.searchParams.get("day");
let month = url.searchParams.get("month");
let year = url.searchParams.get("year");


async function printData() {
    let articles = await dataManager.get_articles_for_day_async(year, month, day);
    console.log(articles);

    let websites = {
        'GameSpot': [],
        'Eurogamer': [],
        'Gameplanet': []
    };

    for(let i = 0; i < articles.length; i++) {
        websites[articles[i].website].push(articles[i]);
    }

    let articlesDiv = document.getElementById('articles');
    for(let i = 0; i < 3; i++) {
        let websiteName = Config.websiteIdToName(i + 1);
        let paddingLeft = 400 * i;
        let websiteArticles = websites[websiteName];

        let websiteColumn = new WebsiteColumn(websiteName, websiteArticles, paddingLeft);
        articlesDiv.appendChild(websiteColumn.toHtml());
    }
}


printData();