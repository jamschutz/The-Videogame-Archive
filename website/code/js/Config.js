var Config = /** @class */ (function () {
    function Config() {
        // do nothing
    }
    Config.websiteIdToName = function (websiteId) {
        if (websiteId === 1)
            return 'GameSpot';
        if (websiteId === 2)
            return 'Eurogamer';
        if (websiteId === 3)
            return 'Gameplanet';
        return 'Unknown';
    };
    Config.API_BASE_URL = "http://127.0.0.1:5000";
    Config.LOCAL_FILE_BASE_URL = "http://localhost:5000/";
    return Config;
}());
