var CalendarDate = /** @class */ (function () {
    function CalendarDate(year, month, day) {
        this.year = (typeof year === 'number') ? year : parseInt(year);
        this.month = (typeof month === 'number') ? month : parseInt(month);
        this.day = (typeof day === 'number') ? day : parseInt(day);
    }
    CalendarDate.prototype.toString = function () {
        return "".concat(month, "/").concat(day, "/").concat(year);
    };
    return CalendarDate;
}());
