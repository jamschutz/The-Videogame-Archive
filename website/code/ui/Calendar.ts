class Calendar {
    private date: CalendarDate;

    constructor() {
        this.date = UrlParser.getDate();
    }

    // html class declarations
    static CONTAINER_ID = 'calendar-month';
    static HEADER_CLASS = 'month-year-title';
    static HEADER_DATE_CLASS = 'calendar-title';
    static BORDER_CLASS = 'calendar-border';
    static CALENDAR_ID = 'calendar-dates';
    static WEEK_HEADER_CLASS = 'weekday-header';
    static WEEKDAY_LABEL_CLASS = 'weekday-label';
    static WEEK_CLASS = 'week';
    static DAY_CLASS = 'day';
    static DAY_NO_DATE_CLASS = 'day-no-date';
    static DAY_LINK_ACTIVE = 'link-active';
    static DAY_LINK_INACTIVE = 'link-inactive';
    static CURRENT_DATE_HIGHLIGHT_ID = 'current-date-highlight';



    // =================================================== //
    // ====== Public methods ============================= //
    // =================================================== //

    public updateHtml(): HTMLElement {
        // grab container
        let containerDiv = document.getElementById(Calendar.CONTAINER_ID);
        // clear current contents
        containerDiv.innerHTML = "";

        // build elements
        let header = this.getHeader();
        let border = this.getBorder();
        let dates = this.getDates();

        // add to container
        containerDiv.appendChild(header);
        containerDiv.appendChild(border);
        containerDiv.appendChild(dates);

        return containerDiv;
    }


    // button functions 
    // note: need the 'any' return type for the onclick to work
    public goToNextMonth(): any {
        this.date.addMonth();
        this.updateHtml();
    }
    public goToPreviousMonth(): any {
        this.date.subtractMonth();
        this.updateHtml();
    }
    public goToNextYear(): any {
        this.date.addYear();
        this.updateHtml();
    }
    public goToPreviousYear(): any {
        this.date.subtractYear();
        this.updateHtml();
    }



    // =================================================== //
    // ====== Helper methods ============================= //
    // =================================================== //


    private getDates(): HTMLElement {
        let container = document.createElement('div');
        container.id = Calendar.CALENDAR_ID;

        // create weekday header
        let weekdayHeader = document.createElement('div');
        weekdayHeader.classList.add(Calendar.WEEK_HEADER_CLASS);
        ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(d => {
            weekdayHeader.appendChild(this.getWeekdayLabel(d));
        });
        container.appendChild(weekdayHeader);

        // create weeks
        let dayOffset = new CalendarDate(this.date.year, this.date.month, 1).getWeekdayInt() - 1;
        let numWeekRows = (this.date.getDaysInMonth() + dayOffset) / 7;
        console.log('day offset: ' + dayOffset + ',  number of rows: ' + numWeekRows);
        for(let i = 0; i < numWeekRows; i++) {
            let week = this.getWeek(i, dayOffset);
            container.append(week);
        }

        return container;
    }


    private getHeader(): HTMLElement {
        // create header object
        let header = document.createElement('h4');
        header.classList.add(Calendar.HEADER_CLASS);

        // create buttons
        let nextYearButton = document.createElement('button');
        let nextMonthButton = document.createElement('button');
        let previousYearButton = document.createElement('button');
        let previousMonthButton = document.createElement('button');

        // add button events
        nextYearButton.onclick = goToNextCalendarYear;
        nextMonthButton.onclick = goToNextCalendarMonth;
        previousYearButton.onclick = goToPreviousCalendarYear;
        previousMonthButton.onclick = goToPreviousCalendarMonth;

        // add button labels
        nextYearButton.innerText = '>>';
        nextMonthButton.innerText = '>';
        previousYearButton.innerText = '<<';
        previousMonthButton.innerText = '<';

        // create date header
        let dateHeader = document.createElement('span');
        dateHeader.id = Calendar.HEADER_DATE_CLASS;
        dateHeader.innerText = this.date.toPrettyString_MonthYear();

        // and child everything to the container
        header.appendChild(previousYearButton);
        header.appendChild(previousMonthButton);
        header.appendChild(dateHeader);
        header.appendChild(nextMonthButton);
        header.appendChild(nextYearButton);

        return header;
    }


    private getBorder(): HTMLElement {
        let border = document.createElement('div');
        border.id = Calendar.BORDER_CLASS;

        // figure out how tall it should be...
        let dayOffset = new CalendarDate(this.date.year, this.date.month, 1).getWeekdayInt() - 1;
        let numWeekRows = Math.floor((this.date.getDaysInMonth() + dayOffset) / 7);

        if(numWeekRows === 5) {
            border.style.height = '239px';
        }
        else {
            border.style.height = '205px';
        }
        return border;
    }


    private getWeekdayLabel(weekday: string): HTMLElement {
        let label = document.createElement('a');
        label.classList.add(Calendar.WEEKDAY_LABEL_CLASS);
        label.innerText = weekday;
        return label;
    }


    private getWeek(weekNumber: number, offset: number): HTMLElement {
        let week = document.createElement('div');
        week.classList.add(Calendar.WEEK_CLASS);

        for(let i = 1; i <= 7; i++) {
            let day = document.createElement('a');
            day.classList.add(Calendar.DAY_CLASS);

            let dateNumber = (i - offset) + (weekNumber * 7);
            // not a date, just filler
            if(dateNumber < 1 || dateNumber > this.date.getDaysInMonth()) {
                day.classList.remove(Calendar.DAY_CLASS);
                day.classList.add(Calendar.DAY_NO_DATE_CLASS)
                day.innerText = '-';
            }
            // add date number text
            else {
                day.classList.add(Calendar.DAY_LINK_ACTIVE);
                day.innerText = dateNumber.toString();
            }

            // if this is the current date, highlight it
            if(dateNumber == this.date.day) {
                day.id = Calendar.CURRENT_DATE_HIGHLIGHT_ID;
            }
            
            // add to week
            week.appendChild(day);
        }

        return week;
    }
}