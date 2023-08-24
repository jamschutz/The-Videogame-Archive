class Calendar {
    public date: CalendarDate;

    constructor() {
        this.date = UrlParser.getDate();
    }

    // html class declarations
    static CONTAINER_ID = 'Calendar-container';
    static HEADER_CLASS = 'Calendar-header';
    static MONTH_YEAR_HEADER_CLASS = 'Calendar-monthYearDisplay';
    static CALENDAR_ID = 'Calendar-calendar';
    static DAY_LABEL_CLASS = 'Calendar-dayLabel';
    static ROW_CLASS = 'Calendar-row';
    static CELL_CLASS = 'Calendar-cell';
    static EMPTY_CELL_CLASS = 'Calendar-empty';
    static LINK_ACTIVE_CLASS = 'Calendar-linkActive';
    static LINK_INACTIVE_CLASS = 'Calendar-linkInactive';
    static CURRENT_DATE_HIGHLIGHT_ID = 'current-date-highlight';



    // =================================================== //
    // ====== Public methods ============================= //
    // =================================================== //

    public async updateHtml(): Promise<void> {
        // grab container
        let containerDiv = document.getElementById(Calendar.CALENDAR_ID);
        // clear current contents
        containerDiv.innerHTML = "";

        // build elements
        let header = this.getHeader();
        containerDiv.appendChild(header);
        await this.getDates();
    }


    // button functions 
    // note: need the 'any' return type for the onclick to work
    public goToNextMonth(): any {
        if(this.date == undefined) {
            this.date = UrlParser.getDate();
        }
        this.date.addMonth();
        this.updateHtml();
    }
    public goToPreviousMonth(): any {
        if(this.date == undefined) {
            this.date = UrlParser.getDate();
        }
        this.date.subtractMonth();
        this.updateHtml();
    }
    public goToNextYear(): any {
        if(this.date == undefined) {
            this.date = UrlParser.getDate();
        }
        this.date.addYear();
        this.updateHtml();
    }
    public goToPreviousYear(): any {
        if(this.date == undefined) {
            this.date = UrlParser.getDate();
        }
        this.date.subtractYear();
        this.updateHtml();
    }



    // =================================================== //
    // ====== Helper methods ============================= //
    // =================================================== //


    private async getDates(): Promise<HTMLElement> {
        let container = document.getElementById(Calendar.CALENDAR_ID);
        container.id = Calendar.CALENDAR_ID;

        // create weekday header
        let weekdayHeader = document.createElement('div');
        weekdayHeader.classList.add(Calendar.ROW_CLASS);
        ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(d => {
            weekdayHeader.appendChild(this.getWeekdayLabel(d));
        });
        container.appendChild(weekdayHeader);

        // create weeks
        let monthStart = new CalendarDate(this.date.year, this.date.month, 1);
        let monthEnd  = new CalendarDate(this.date.year, this.date.month, this.date.getDaysInMonth());
        let monthArticleCounts = await DataManager.getArticleCountBetweenDatesAsync(monthStart, monthEnd);

        let dayOffset = monthStart.getWeekdayInt() - 1;
        let numWeekRows = (this.date.getDaysInMonth() + dayOffset) / 7;
        for(let i = 0; i < numWeekRows; i++) {
            let week = await this.getWeek(i, dayOffset, monthArticleCounts);
            container.append(week);
        }

        return container;
    }


    private getHeader(): HTMLElement {
        // create header object
        let header = document.createElement('div');
        header.classList.add(Calendar.HEADER_CLASS);
        header.classList.add(Calendar.ROW_CLASS);

        // create buttons
        let nextYearButton = document.createElement('button');
        let nextMonthButton = document.createElement('button');
        let previousYearButton = document.createElement('button');
        let previousMonthButton = document.createElement('button');

        // add button events
        var calendarSelf = this;
        nextYearButton.addEventListener('click', function(event) {
            calendarSelf.goToNextYear();
        });
        nextMonthButton.addEventListener('click', function(event) {
            calendarSelf.goToNextMonth();
        });
        previousYearButton.addEventListener('click', function(event) {
            calendarSelf.goToPreviousYear();
        });
        previousMonthButton.addEventListener('click', function(event) {
            calendarSelf.goToPreviousMonth();
        });

        // add button labels
        nextYearButton.innerText = '>>';
        nextMonthButton.innerText = '>';
        previousYearButton.innerText = '<<';
        previousMonthButton.innerText = '<';

        // create date header
        let dateHeader = document.createElement('span');
        dateHeader.classList.add(Calendar.MONTH_YEAR_HEADER_CLASS);
        dateHeader.innerText = this.date.toPrettyString_MonthYear();

        // and child everything to the container
        header.appendChild(previousYearButton);
        header.appendChild(previousMonthButton);
        header.appendChild(dateHeader);
        header.appendChild(nextMonthButton);
        header.appendChild(nextYearButton);

        return header;
    }


    private getWeekdayLabel(weekday: string): HTMLElement {
        let label = document.createElement('a');
        label.classList.add(Calendar.CELL_CLASS);
        label.classList.add(Calendar.DAY_LABEL_CLASS);
        label.innerText = weekday;
        return label;
    }


    private dayHasArticles(day: number, articleCounts: GetArticleCountResponse): boolean {
        let targetDate = `${this.date.month}/${day}/${this.date.year}`;

        for(let i = 0; i < articleCounts.data.length; i++) {
            let info = articleCounts.data[i];
            let isTargetDate = info.date.toString() === targetDate;
            
            if(isTargetDate) {
                return info.count > 0;
            }
        }

        // no records for this date
        return false;
    }


    private async getWeek(weekNumber: number, offset: number, articleCounts: GetArticleCountResponse): Promise<HTMLElement> {
        let week = document.createElement('div');
        week.classList.add(Calendar.ROW_CLASS);

        for(let i = 1; i <= 7; i++) {
            let day = document.createElement('a');
            day.classList.add(Calendar.CELL_CLASS);

            let dateNumber = (i - offset) + (weekNumber * 7);
            // not a date, just filler
            if(dateNumber < 1 || dateNumber > this.date.getDaysInMonth()) {
                day.classList.add(Calendar.EMPTY_CELL_CLASS)
                day.innerText = '-';
            }
            // add date number text
            else {
                // check if has articles
                let dayHasArticles = this.dayHasArticles(dateNumber, articleCounts);
                let dayClass = dayHasArticles? Calendar.LINK_ACTIVE_CLASS : Calendar.LINK_INACTIVE_CLASS;

                day.classList.add(dayClass);
                day.innerText = dateNumber.toString();
                day.href = `/${this.date.year}/${this.date.month}/${dateNumber.toString()}`;
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