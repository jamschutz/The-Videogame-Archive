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
    Config.url_to_filename = function (url, day) {
        var filename = "".concat(day, "_").concat(url.split("/").slice(4).join("_"));
        // if ends in underscore, remove it
        if (filename[filename.length - 1] === "_") {
            filename = filename.slice(0, filename.length - 1);
        }
        return filename;
    };
    Config.API_BASE_URL = "http://127.0.0.1:5000";
    Config.LOCAL_FILE_BASE_URL = "http://localhost:5000/";
    return Config;
}());
