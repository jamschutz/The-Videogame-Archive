class Config {
    constructor() {
        // do nothing
    }

    static API_BASE_URL = "http://127.0.0.1:5000";
    static LOCAL_FILE_BASE_URL = "http://localhost:5000";

    static websiteIdToName(websiteId : number) : string {
        if(websiteId === 1) return 'GameSpot';
        if(websiteId === 2) return 'Eurogamer';
        if(websiteId === 3) return 'Gameplanet';
        
        return 'Unknown';
    }


    static url_to_filename(url: string, day: string): string {
        let filename = `${day}_${url.split("/").slice(4).join("_")}`;

        // if ends in underscore, remove it
        if(filename[filename.length - 1] === "_") {
            filename = filename.slice(0, filename.length - 1);
        }

        return filename;
    }
}