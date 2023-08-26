class Calendar {
    public date: CalendarDate;
    public datesWithArticles: { [id: number]: boolean };
    public minYearCached: number;
    public maxYearCached: number;

    constructor() {
        this.date = UrlParser.getDate();

        // // parse article date info from session storage
        // this.datesWithArticles = JSON.parse(sessionStorage.getItem("datesWithArticles"));
        // this.minYearCached = parseInt(sessionStorage.getItem("minYearCached"));
        // this.maxYearCached = parseInt(sessionStorage.getItem("maxYearCached"));

        // // if no session storage data, init these to new
        // if(this.datesWithArticles === null || this.datesWithArticles === undefined || 
        //    isNaN(this.minYearCached) || isNaN(this.maxYearCached)) {
        //     this.datesWithArticles = {};
        //     this.minYearCached = null;
        //     this.maxYearCached = null;
        // }

        this.minYearCached = null;
        this.maxYearCached = null;
        this.datesWithArticles = {};
        
        console.time('updateDateHasArticlesLookup')
        this.checkToUpdateDatesWithArticles();
        console.timeEnd('updateDateHasArticlesLookup')
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
    static CURRENT_DATE_HIGHLIGHT_ID = 'Calendar-hightlight';



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
        this.date.addMonth();
        this.updateHtml();
        this.checkToUpdateDatesWithArticles();
    }
    public goToPreviousMonth(): any {
        this.date.subtractMonth();
        this.updateHtml();
        this.checkToUpdateDatesWithArticles();
    }
    public goToNextYear(): any {
        this.date.addYear();
        this.updateHtml();
        this.checkToUpdateDatesWithArticles();
    }
    public goToPreviousYear(): any {
        this.date.subtractYear();
        this.updateHtml();
        this.checkToUpdateDatesWithArticles();
    }


    public checkToUpdateDatesWithArticles() {
        // if first check on load and no session storage, get surrounding years
        if(this.maxYearCached === null || this.minYearCached === null) {
            this.updateDatesWithArticles(this.date.year - 1, this.date.year + 1);
            return;
        }

        if(this.date.year >= this.maxYearCached) {
            console.log('getting next year dates!')
            this.updateDatesWithArticles(this.maxYearCached + 1, this.date.year + 1);
        }
        else if(this.date.year <= this.minYearCached) {
            console.log('getting previous year dates!');
            this.updateDatesWithArticles(this.date.year - 1, this.minYearCached);
        }
    }


    public async updateDatesWithArticles(startYear: number, endYear: number): Promise<void> {
        // init years as calendar dates
        let startDate = new CalendarDate(startYear, 1, 1); // January 1, a year before current date
        let endDate = new CalendarDate(endYear, 12, 31); // December 31, a year after current date

        // get dates with articles
        let datesWithArticlesResponse = await DataManager.getDatesWithArticles(startDate, endDate);

        // add to cache
        for(const key in datesWithArticlesResponse) {
            let date = parseInt(key);
            this.datesWithArticles[date] = true;
        }

        // update our cached date range
        this.minYearCached = startYear;
        this.maxYearCached = endYear;

        // update session storage
        // sessionStorage.setItem("datesWithArticles", JSON.stringify(this.datesWithArticles));
        // sessionStorage.setItem("minYearCached", this.minYearCached.toString());
        // sessionStorage.setItem("maxYearCached", this.maxYearCached.toString());

        // udpate html
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
        let dayOffset = monthStart.getWeekdayInt() - 1;
        let numWeekRows = (this.date.getDaysInMonth() + dayOffset) / 7;
        for(let i = 0; i < numWeekRows; i++) {
            let week = await this.getWeek(i, dayOffset, monthStart);
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


    private async getWeek(weekNumber: number, offset: number, monthStart: CalendarDate): Promise<HTMLElement> {
        let week = document.createElement('div');
        week.classList.add(Calendar.ROW_CLASS);

        for(let i = 1; i <= 7; i++) {
            let day = document.createElement('a');
            day.classList.add(Calendar.CELL_CLASS);

            let dateNumber = (i - offset) + (weekNumber * 7);
            monthStart.day = dateNumber;
            // not a date, just filler
            if(dateNumber < 1 || dateNumber > this.date.getDaysInMonth()) {
                day.classList.add(Calendar.EMPTY_CELL_CLASS)
                day.innerText = '-';
            }
            // add date number text
            else {
                // check if has articles
                let dayClass = (monthStart.toNumber() in this.datesWithArticles)? Calendar.LINK_ACTIVE_CLASS : Calendar.LINK_INACTIVE_CLASS;

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