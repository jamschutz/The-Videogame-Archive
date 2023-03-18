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
        if (websiteId === 4)
            return 'JayIsGames';
        if (websiteId === 5)
            return 'TIGSource';
        if (websiteId === 6)
            return 'Indygamer';
        return 'Unknown';
    };
    Config.websiteNameToId = function (websiteName) {
        if (websiteName === 'GameSpot')
            return 1;
        if (websiteName === 'Eurogamer')
            return 2;
        if (websiteName === 'Gameplanet')
            return 3;
        if (websiteName === 'JayIsGames')
            return 4;
        if (websiteName === 'TIGSource')
            return 5;
        if (websiteName === 'Indygamer')
            return 6;
        return -1;
    };
    Config.url_to_filename = function (url, day, websiteId) {
        var filename = '';
        // gamespot has a different file naming convention
        if (websiteId === 1) {
            // convert https://example.com/something/TAKE_THIS_PART
            filename = "".concat(day, "_").concat(url.split("/").slice(4).join("_"));
        }
        else {
            // convert https://www.eurogamer.net/TAKE_THIS_PART
            filename = "".concat(day, "_").concat(url.split("/").slice(3).join("_"));
        }
        // if it has url parameters, remove them
        if (url.indexOf('?') > -1) {
            filename = filename.substring(0, url.indexOf('?'));
        }
        // if ends in underscore, remove it
        if (filename[filename.length - 1] === "_") {
            filename = filename.slice(0, filename.length - 1);
        }
        return filename;
    };
    Config.API_BASE_URL = "http://127.0.0.1:5000";
    Config.LOCAL_FILE_BASE_URL = "http://localhost:5000";
    return Config;
}());
