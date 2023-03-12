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

    public toHtml(): HTMLElement {
        let containerDiv = this.getCalendarContainer();
        let header = this.getHeader();
        let border = this.getBorder();


        return containerDiv;
    }


    // button functions 
    // note: need the 'any' return type for the onclick to work
    public goToNextMonth(): any {

    }
    public goToPreviousMonth(): any {
        
    }
    public goToNextYear(): any {

    }
    public goToPreviousYear(): any {
        
    }



    // =================================================== //
    // ====== Helper methods ============================= //
    // =================================================== //


    private getDates(): HTMLElement {
        let container = document.createElement('div');

        // create weekday header
        let weekdayHeader = document.createElement('div');
        weekdayHeader.classList.add(Calendar.WEEK_HEADER_CLASS);
        ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(d => {
            weekdayHeader.appendChild(this.getWeekdayLabel(d));
        });

                
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
        nextYearButton.onclick = this.goToNextYear();
        nextMonthButton.onclick = this.goToNextMonth();
        previousYearButton.onclick = this.goToPreviousYear();
        previousMonthButton.onclick = this.goToPreviousMonth();

        // add button labels
        nextYearButton.innerText = '&gt;&gt;';
        nextMonthButton.innerText = '&gt;';
        previousYearButton.innerText = '&lt;&lt;';
        previousMonthButton.innerText = '&lt;';

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


    private getCalendarContainer(): HTMLElement {
        let containerDiv = document.createElement('div');
        containerDiv.id = Calendar.CONTAINER_ID;
        return containerDiv;
    }


    private getBorder(): HTMLElement {
        let border = document.createElement('div');
        border.id = Calendar.BORDER_CLASS;
        return border;
    }


    private getWeekdayLabel(weekday: string): HTMLElement {
        let label = document.createElement('a');
        label.classList.add(Calendar.WEEKDAY_LABEL_CLASS);
        label.innerText = weekday;
        return label;
    }
}