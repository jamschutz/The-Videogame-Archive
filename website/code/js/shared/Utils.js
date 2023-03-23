var Utils = /** @class */ (function () {
    function Utils() {
        // do nothing
    }
    Utils.getTwoCharNum = function (n) {
        // make sure n is a number
        if (typeof n === 'string') {
            n = parseInt(n);
        }
        if (n < 10) {
            return "0".concat(n.toString());
        }
        else {
            return n.toString();
        }
    };
    Utils.getThreeCharNum = function (n) {
        // make sure n is a number
        if (typeof n === 'string') {
            n = parseInt(n);
        }
        if (n < 10) {
            return "00".concat(n.toString());
        }
        else if (n < 100) {
            return "0".concat(n.toString());
        }
        else {
            return n.toString();
        }
    };
    Utils.getNormalizedMagazineTitle = function (title) {
        var titleComponents = title.split(' ');
        titleComponents.forEach(function (c) {
            c = c.replace('/[^0-9A-Z]+/gi', "");
        });
        return titleComponents.join('_');
    };
    return Utils;
}());
