var Calendar = /** @class */ (function () {
    function Calendar() {
        this.date = UrlParser.getDate();
    }
    // =================================================== //
    // ====== Public methods ============================= //
    // =================================================== //
    Calendar.prototype.updateHtml = function () {
        // grab container
        var containerDiv = document.getElementById(Calendar.CONTAINER_ID);
        // clear current contents
        containerDiv.innerHTML = "";
        // build elements
        var header = this.getHeader();
        var border = this.getBorder();
        var dates = this.getDates();
        // add to container
        containerDiv.appendChild(header);
        containerDiv.appendChild(border);
        containerDiv.appendChild(dates);
        return containerDiv;
    };
    // button functions 
    // note: need the 'any' return type for the onclick to work
    Calendar.prototype.goToNextMonth = function () {
        this.date.addMonth();
        this.updateHtml();
    };
    Calendar.prototype.goToPreviousMonth = function () {
        this.date.subtractMonth();
        this.updateHtml();
    };
    Calendar.prototype.goToNextYear = function () {
        this.date.addYear();
        this.updateHtml();
    };
    Calendar.prototype.goToPreviousYear = function () {
        this.date.subtractYear();
        this.updateHtml();
    };
    // =================================================== //
    // ====== Helper methods ============================= //
    // =================================================== //
    Calendar.prototype.getDates = function () {
        var _this = this;
        var container = document.createElement('div');
        container.id = Calendar.CALENDAR_ID;
        // create weekday header
        var weekdayHeader = document.createElement('div');
        weekdayHeader.classList.add(Calendar.WEEK_HEADER_CLASS);
        ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(function (d) {
            weekdayHeader.appendChild(_this.getWeekdayLabel(d));
        });
        container.appendChild(weekdayHeader);
        // create weeks
        var dayOffset = new CalendarDate(this.date.year, this.date.month, 1).getWeekdayInt() - 1;
        var numWeekRows = (this.date.getDaysInMonth() + dayOffset) % 7;
        console.log('day offset: ' + dayOffset + ',  number of rows: ' + numWeekRows);
        for (var i = 0; i < numWeekRows; i++) {
            var week = this.getWeek(i, dayOffset);
            container.append(week);
        }
        return container;
    };
    Calendar.prototype.getHeader = function () {
        // create header object
        var header = document.createElement('h4');
        header.classList.add(Calendar.HEADER_CLASS);
        // create buttons
        var nextYearButton = document.createElement('button');
        var nextMonthButton = document.createElement('button');
        var previousYearButton = document.createElement('button');
        var previousMonthButton = document.createElement('button');
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
        var dateHeader = document.createElement('span');
        dateHeader.id = Calendar.HEADER_DATE_CLASS;
        dateHeader.innerText = this.date.toPrettyString_MonthYear();
        // and child everything to the container
        header.appendChild(previousYearButton);
        header.appendChild(previousMonthButton);
        header.appendChild(dateHeader);
        header.appendChild(nextMonthButton);
        header.appendChild(nextYearButton);
        return header;
    };
    Calendar.prototype.getBorder = function () {
        var border = document.createElement('div');
        border.id = Calendar.BORDER_CLASS;
        return border;
    };
    Calendar.prototype.getWeekdayLabel = function (weekday) {
        var label = document.createElement('a');
        label.classList.add(Calendar.WEEKDAY_LABEL_CLASS);
        label.innerText = weekday;
        return label;
    };
    Calendar.prototype.getWeek = function (weekNumber, offset) {
        var week = document.createElement('div');
        week.classList.add(Calendar.WEEK_CLASS);
        for (var i = 1; i <= 7; i++) {
            var day_1 = document.createElement('a');
            day_1.classList.add(Calendar.DAY_CLASS);
            var dateNumber = (i - offset) + (weekNumber * 7);
            // not a date, just filler
            if (dateNumber < 1 || dateNumber > this.date.getDaysInMonth()) {
                day_1.classList.remove(Calendar.DAY_CLASS);
                day_1.classList.add(Calendar.DAY_NO_DATE_CLASS);
                day_1.innerText = '-';
            }
            // add date number text
            else {
                day_1.classList.add(Calendar.DAY_LINK_ACTIVE);
                day_1.innerText = dateNumber.toString();
            }
            // if this is the current date, highlight it
            if (dateNumber == this.date.day) {
                day_1.id = Calendar.CURRENT_DATE_HIGHLIGHT_ID;
            }
            // add to week
            week.appendChild(day_1);
        }
        return week;
    };
    // html class declarations
    Calendar.CONTAINER_ID = 'calendar-month';
    Calendar.HEADER_CLASS = 'month-year-title';
    Calendar.HEADER_DATE_CLASS = 'calendar-title';
    Calendar.BORDER_CLASS = 'calendar-border';
    Calendar.CALENDAR_ID = 'calendar-dates';
    Calendar.WEEK_HEADER_CLASS = 'weekday-header';
    Calendar.WEEKDAY_LABEL_CLASS = 'weekday-label';
    Calendar.WEEK_CLASS = 'week';
    Calendar.DAY_CLASS = 'day';
    Calendar.DAY_NO_DATE_CLASS = 'day-no-date';
    Calendar.DAY_LINK_ACTIVE = 'link-active';
    Calendar.DAY_LINK_INACTIVE = 'link-inactive';
    Calendar.CURRENT_DATE_HIGHLIGHT_ID = 'current-date-highlight';
    return Calendar;
}());
