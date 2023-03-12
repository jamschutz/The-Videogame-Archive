class Calendar {
    private date: CalendarDate;

    constructor() {
        this.date = UrlParser.getDate();
    }
}