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
    return Utils;
}());
