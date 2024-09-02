import { CalendarDate } from "./CalendarDate"

export class Article {
    constructor() {
        this.date = new CalendarDate(1995, 1, 1);
        this.title = "";
        this.subtitle = "";
        this.author = "";
        this.url = "";
        this.website = "";
        this.thumbnail = "";
        this.type = "";
    }

    date : CalendarDate;
    title: string;
    subtitle: string;
    author: string;
    url: string;
    website: string;
    thumbnail: string;
    type: string;
}