var DateHeader = /** @class */ (function () {
    function DateHeader() {
        this.date = UrlParser.getDate();
    }
    DateHeader.prototype.updateHtml = function () {
        var span = document.getElementById(DateHeader.DISPLAY_SPAN_ID);
        span.innerText = this.date.toPrettyString_FullDate();
    };
    // html class declarations
    DateHeader.DISPLAY_SPAN_ID = 'date-display';
    return DateHeader;
}());
