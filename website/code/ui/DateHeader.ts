class DateHeader {
    private date: CalendarDate;

    constructor() {
        this.date = UrlParser.getDate();
    }

    // html class declarations
    static DISPLAY_SPAN_ID = 'date-display';


    public updateHtml(): void {
        let span = document.getElementById(DateHeader.DISPLAY_SPAN_ID);
        span.innerText = this.date.toPrettyString_FullDate();
    }
}