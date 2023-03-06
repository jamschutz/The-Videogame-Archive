// export {}

let dataManager = new DataManager();


async function printData() {
    let data = await dataManager.get_articles_for_day_async("2000", "10", "22");
    console.log(data);
}


printData();