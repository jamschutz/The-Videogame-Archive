class Config {
    constructor() {
        // do nothing
    }

    static API_BASE_URL = "http://127.0.0.1:5000";
    static LOCAL_FILE_BASE_URL = "http://localhost:5000/";

    static websiteIdToName(websiteId : number) : string {
        if(websiteId === 1) return 'GameSpot';
        if(websiteId === 2) return 'Eurogamer';
        if(websiteId === 3) return 'Gameplanet';
        
        return 'Unknown';
    }
}