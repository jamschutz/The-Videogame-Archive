var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var Calendar = /** @class */ (function () {
    function Calendar() {
        this.date = UrlParser.getDate();
    }
    // =================================================== //
    // ====== Public methods ============================= //
    // =================================================== //
    Calendar.prototype.updateHtml = function () {
        return __awaiter(this, void 0, void 0, function () {
            var containerDiv, header, border, dates;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        containerDiv = document.getElementById(Calendar.CONTAINER_ID);
                        // clear current contents
                        containerDiv.innerHTML = "";
                        header = this.getHeader();
                        border = this.getBorder();
                        return [4 /*yield*/, this.getDates()];
                    case 1:
                        dates = _a.sent();
                        // add to container
                        containerDiv.appendChild(header);
                        containerDiv.appendChild(border);
                        containerDiv.appendChild(dates);
                        return [2 /*return*/];
                }
            });
        });
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
        return __awaiter(this, void 0, void 0, function () {
            var container, weekdayHeader, monthStart, monthEnd, monthArticleCounts, dayOffset, numWeekRows, i, week;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        container = document.createElement('div');
                        container.id = Calendar.CALENDAR_ID;
                        weekdayHeader = document.createElement('div');
                        weekdayHeader.classList.add(Calendar.WEEK_HEADER_CLASS);
                        ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(function (d) {
                            weekdayHeader.appendChild(_this.getWeekdayLabel(d));
                        });
                        container.appendChild(weekdayHeader);
                        monthStart = new CalendarDate(this.date.year, this.date.month, 1);
                        monthEnd = new CalendarDate(this.date.year, this.date.month, this.date.getDaysInMonth());
                        return [4 /*yield*/, DataManager.getArticleCountBetweenDatesAsync(monthStart, monthEnd)];
                    case 1:
                        monthArticleCounts = _a.sent();
                        dayOffset = monthStart.getWeekdayInt() - 1;
                        numWeekRows = (this.date.getDaysInMonth() + dayOffset) / 7;
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < numWeekRows)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.getWeek(i, dayOffset, monthArticleCounts)];
                    case 3:
                        week = _a.sent();
                        container.append(week);
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, container];
                }
            });
        });
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
        // figure out how tall it should be...
        var dayOffset = new CalendarDate(this.date.year, this.date.month, 1).getWeekdayInt() - 1;
        var numWeekRows = Math.floor((this.date.getDaysInMonth() + dayOffset - 1) / 7);
        if (numWeekRows === 5) {
            border.style.height = '239px';
        }
        else {
            border.style.height = '205px';
        }
        return border;
    };
    Calendar.prototype.getWeekdayLabel = function (weekday) {
        var label = document.createElement('a');
        label.classList.add(Calendar.WEEKDAY_LABEL_CLASS);
        label.innerText = weekday;
        return label;
    };
    Calendar.prototype.dayHasArticles = function (day, articleCounts) {
        var targetDate = "".concat(this.date.month, "/").concat(day, "/").concat(this.date.year);
        for (var i = 0; i < articleCounts.data.length; i++) {
            var info = articleCounts.data[i];
            var isTargetDate = info.date.toString() === targetDate;
            if (isTargetDate) {
                return info.count > 0;
            }
        }
        // no records for this date
        return false;
    };
    Calendar.prototype.getWeek = function (weekNumber, offset, articleCounts) {
        return __awaiter(this, void 0, void 0, function () {
            var week, i, day_1, dateNumber, dayHasArticles, dayClass;
            return __generator(this, function (_a) {
                week = document.createElement('div');
                week.classList.add(Calendar.WEEK_CLASS);
                for (i = 1; i <= 7; i++) {
                    day_1 = document.createElement('a');
                    day_1.classList.add(Calendar.DAY_CLASS);
                    dateNumber = (i - offset) + (weekNumber * 7);
                    // not a date, just filler
                    if (dateNumber < 1 || dateNumber > this.date.getDaysInMonth()) {
                        day_1.classList.remove(Calendar.DAY_CLASS);
                        day_1.classList.add(Calendar.DAY_NO_DATE_CLASS);
                        day_1.innerText = '-';
                    }
                    // add date number text
                    else {
                        dayHasArticles = this.dayHasArticles(dateNumber, articleCounts);
                        dayClass = dayHasArticles ? Calendar.DAY_LINK_ACTIVE : Calendar.DAY_LINK_INACTIVE;
                        day_1.classList.add(dayClass);
                        day_1.innerText = dateNumber.toString();
                        day_1.href = "/html/archive.html?date=".concat(this.date.year).concat(Utils.getTwoCharNum(this.date.month)).concat(Utils.getTwoCharNum(dateNumber.toString()));
                    }
                    // if this is the current date, highlight it
                    if (dateNumber == this.date.day) {
                        day_1.id = Calendar.CURRENT_DATE_HIGHLIGHT_ID;
                    }
                    // add to week
                    week.appendChild(day_1);
                }
                return [2 /*return*/, week];
            });
        });
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
