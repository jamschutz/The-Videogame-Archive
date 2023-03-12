class CalendarDate {
    public year : number;
    public month : number;
    public day : number;

    constructor(year: number | string, month: number | string, day: number | string) {
        console.log('year: ' + year + ', month: ' + month + ', day: ' + day);

        this.year  = (typeof year === 'number')? year : parseInt(year);
        this.month = (typeof month === 'number')? month : parseInt(month);
        this.day   = (typeof day === 'number')? day : parseInt(day);
    }


    public toString(): string {
        return `${this.month}/${this.day}/${this.year}`;
    }
}