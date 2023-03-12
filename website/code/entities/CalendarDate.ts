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


    public toPrettyString_MonthYear(): string {
        return `${this.getMonthString()}, ${this.year}`;
    }


    public addDay(): void {
        this.day++;

        if(this.day > this.getDaysInMonth()) {
            this.day = 1;
            this.addMonth();
        }
    }
    public subtractDay(): void {
        this.day--;

        if(this.day < 1) {
            this.subtractMonth();
            this.day = this.getDaysInMonth();
        }
    }


    public addMonth(): void {
        this.month++;

        if(this.month > 12) {
            this.month = 1;
            this.year++;
        }
    }
    public subtractMonth(): void {
        this.month--;

        if(this.month < 1) {
            this.month = 12;
            this.year--;
        }
    }


    public addYear(): void {
        this.year++;
    }
    public subtractYear(): void {
        this.year--;
    }


    public getDaysInMonth(): number {
        switch(this.month) {
            case 1: return 31;
            case 2: return this.isLeapYear()? 29: 28;
            case 3: return 31;
            case 4: return 30;
            case 5: return 31;
            case 6: return 30;
            case 7: return 31;
            case 8: return 31;
            case 9: return 30;
            case 10: return 31;
            case 11: return 30;
            case 12: return 31;
        }
    }


    public getWeekdayInt(): number {
        let helper = new Date(this.toString());
        let weekday = helper.toLocaleString('en-us', {weekday:'short'})

        console.log(`getting weekday int for date ${this.toString()}, got weekday: ${weekday}`);
        
        if(weekday === 'Sun') return 1;
        if(weekday === 'Mon') return 2;
        if(weekday === 'Tue') return 3;
        if(weekday === 'Wed') return 4;
        if(weekday === 'Thu') return 5;
        if(weekday === 'Fri') return 6;
        if(weekday === 'Sat') return 7;

        console.error(`unknown weekday: ${weekday}`);
        return 0;
    }


    public isLeapYear(): boolean {
        // if divisible by 100, special case
        if(this.year % 100 === 0) {
            // if it's divisible by 400, it's a leap year, otherwise, it isn't
            return this.year % 400 === 0;
        }

        // otherwise, return if it's divisible by 4
        return this.year % 4 === 0;
    }


    private getMonthString(): string {
        switch(this.month) {
            case 1: return 'January';
            case 2: return 'February';
            case 3: return 'March';
            case 4: return 'April';
            case 5: return 'May';
            case 6: return 'June';
            case 7: return 'July';
            case 8: return 'August';
            case 9: return 'September';
            case 10: return 'October';
            case 11: return 'November';
            case 12: return 'December';
        }
    }
}