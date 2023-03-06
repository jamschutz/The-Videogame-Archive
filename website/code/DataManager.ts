class DataManager {
    constructor() {
        // do nothing
    }

    get_articles_for_day(year: string, month: string, day: string) {
        fetch(`${Config.API_BASE_URL}/Articles?year=${year}&month=${month}&day=${day}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then((json) => {
            console.log(json);
            return json;
        });
    }
}