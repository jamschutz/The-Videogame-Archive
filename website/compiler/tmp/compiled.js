


var CalendarDate = /** @class */ (function () {
    function CalendarDate(year, month, day) {
        this.year = (typeof year === 'number') ? year : parseInt(year);
        this.month = (typeof month === 'number') ? month : parseInt(month);
        this.day = (typeof day === 'number') ? day : parseInt(day);
    }
    CalendarDate.fromDateString = function (dateString) {
        if (typeof dateString === 'number') {
            dateString = dateString.toString();
        }
        // datestring in format YYYYMMDD
        var year = dateString.substring(0, 4);
        var month = dateString.substring(4, 6);
        var day = dateString.substring(6);
        return new CalendarDate(year, month, day);
    };
    CalendarDate.prototype.toString = function () {
        return "".concat(this.month, "/").concat(this.day, "/").concat(this.year);
    };
    CalendarDate.prototype.toUrlString = function () {
        return "".concat(this.year).concat(Utils.getTwoCharNum(this.month)).concat(Utils.getTwoCharNum(this.day));
    };
    CalendarDate.prototype.toPrettyString_MonthYear = function () {
        return "".concat(this.getMonthString(), ", ").concat(this.year);
    };
    CalendarDate.prototype.toPrettyString_FullDate = function () {
        return "".concat(this.getMonthString(), " ").concat(this.day, ", ").concat(this.year);
    };
    CalendarDate.prototype.addDay = function () {
        this.day++;
        if (this.day > this.getDaysInMonth()) {
            this.day = 1;
            this.addMonth();
        }
    };
    CalendarDate.prototype.subtractDay = function () {
        this.day--;
        if (this.day < 1) {
            this.subtractMonth();
            this.day = this.getDaysInMonth();
        }
    };
    CalendarDate.prototype.addMonth = function () {
        this.month++;
        if (this.month > 12) {
            this.month = 1;
            this.year++;
        }
    };
    CalendarDate.prototype.subtractMonth = function () {
        this.month--;
        if (this.month < 1) {
            this.month = 12;
            this.year--;
        }
    };
    CalendarDate.prototype.addYear = function () {
        this.year++;
    };
    CalendarDate.prototype.subtractYear = function () {
        this.year--;
    };
    CalendarDate.prototype.getDaysInMonth = function () {
        switch (this.month) {
            case 1: return 31;
            case 2: return this.isLeapYear() ? 29 : 28;
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
    };
    CalendarDate.prototype.getWeekdayInt = function () {
        var helper = new Date(this.toString());
        var weekday = helper.toLocaleString('en-us', { weekday: 'short' });
        if (weekday === 'Sun')
            return 1;
        if (weekday === 'Mon')
            return 2;
        if (weekday === 'Tue')
            return 3;
        if (weekday === 'Wed')
            return 4;
        if (weekday === 'Thu')
            return 5;
        if (weekday === 'Fri')
            return 6;
        if (weekday === 'Sat')
            return 7;
        console.error("unknown weekday: ".concat(weekday));
        return 0;
    };
    CalendarDate.prototype.isLeapYear = function () {
        // if divisible by 100, special case
        if (this.year % 100 === 0) {
            // if it's divisible by 400, it's a leap year, otherwise, it isn't
            return this.year % 400 === 0;
        }
        // otherwise, return if it's divisible by 4
        return this.year % 4 === 0;
    };
    CalendarDate.prototype.getMonthString = function () {
        switch (this.month) {
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
    };
    return CalendarDate;
}());



var Article = /** @class */ (function () {
    function Article() {
    }
    return Article;
}());



var Utils = /** @class */ (function () {
    function Utils() {
        // do nothing
    }
    Utils.getTwoCharNum = function (n) {
        // make sure n is a number
        if (typeof n === 'string') {
            n = parseInt(n);
        }
        if (n < 10) {
            return "0".concat(n.toString());
        }
        else {
            return n.toString();
        }
    };
    Utils.getThreeCharNum = function (n) {
        // make sure n is a number
        if (typeof n === 'string') {
            n = parseInt(n);
        }
        if (n < 10) {
            return "00".concat(n.toString());
        }
        else if (n < 100) {
            return "0".concat(n.toString());
        }
        else {
            return n.toString();
        }
    };
    Utils.getNormalizedMagazineTitle = function (title) {
        var titleComponents = title.split(' ');
        titleComponents.forEach(function (c) {
            c = c.replace('/[^0-9A-Z]+/gi', "");
        });
        return titleComponents.join('_');
    };
    return Utils;
}());



var Config = /** @class */ (function () {
    function Config() {
        // do nothing
    }
    Config.websiteIdToName = function (websiteId) {
        if (websiteId === 1)
            return 'GameSpot';
        if (websiteId === 2)
            return 'Eurogamer';
        if (websiteId === 3)
            return 'Gameplanet';
        if (websiteId === 4)
            return 'JayIsGames';
        if (websiteId === 5)
            return 'TIGSource';
        if (websiteId === 6)
            return 'Indygamer';
        return 'Unknown';
    };
    Config.websiteNameToId = function (websiteName) {
        if (websiteName === 'GameSpot')
            return 1;
        if (websiteName === 'Eurogamer')
            return 2;
        if (websiteName === 'Gameplanet')
            return 3;
        if (websiteName === 'JayIsGames')
            return 4;
        if (websiteName === 'TIGSource')
            return 5;
        if (websiteName === 'Indygamer')
            return 6;
        return -1;
    };
    Config.url_to_filename = function (url, day, websiteId) {
        var filename = '';
        // gamespot has a different file naming convention
        if (websiteId === 1) {
            // convert https://example.com/something/TAKE_THIS_PART
            filename = "".concat(day, "_").concat(url.split("/").slice(4).join("_"));
        }
        else {
            // convert https://www.eurogamer.net/TAKE_THIS_PART
            filename = "".concat(day, "_").concat(url.split("/").slice(3).join("_"));
        }
        // if it has url parameters, remove them
        if (url.indexOf('?') > -1) {
            filename = filename.substring(0, url.indexOf('?'));
        }
        // if ends in underscore, remove it
        if (filename[filename.length - 1] === "_") {
            filename = filename.slice(0, filename.length - 1);
        }
        return filename;
    };
    Config.API_BASE_URL = " https://vga-functionapp-dev.azurewebsites.net/api";
    Config.LOCAL_FILE_BASE_URL = "http://localhost:5000";
    return Config;
}());



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
var DataManager = /** @class */ (function () {
    function DataManager() {
        // do nothing
    }
    DataManager.prototype.getArticlesForDayAsync = function (date) {
        return __awaiter(this, void 0, void 0, function () {
            var response, json, articles, i, article;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(Config.API_BASE_URL, "/Articles?year=").concat(date.year, "&month=").concat(date.month, "&day=").concat(date.day), {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        json = _a.sent();
                        articles = [];
                        for (i = 0; i < json.length; i++) {
                            article = new Article();
                            article.title = json[i]['title'];
                            article.url = json[i]['url'];
                            article.website = Config.websiteIdToName(json[i]['website']);
                            article.date = new CalendarDate(date.year, date.month, date.day);
                            article.author = json[i]['author'];
                            article.subtitle = json[i]['subtitle'];
                            article.thumbnail = json[i]['thumbnail'];
                            articles.push(article);
                        }
                        return [2 /*return*/, articles];
                }
            });
        });
    };
    DataManager.getArticleCountBetweenDatesAsync = function (start, end) {
        return __awaiter(this, void 0, void 0, function () {
            var response, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(Config.API_BASE_URL, "/ArticleCount?start=").concat(start.toUrlString(), "&end=").concat(end.toUrlString()), {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })];
                    case 1:
                        response = _b.sent();
                        _a = GetArticleCountResponse.bind;
                        return [4 /*yield*/, response.json()];
                    case 2: return [2 /*return*/, new (_a.apply(GetArticleCountResponse, [void 0, _b.sent()]))()];
                }
            });
        });
    };
    DataManager.getSearchResults = function (searchRequest) {
        return __awaiter(this, void 0, void 0, function () {
            var response, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(Config.API_BASE_URL, "/Search?term=").concat(searchRequest.searchTerms.join('+')), {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })];
                    case 1:
                        response = _b.sent();
                        _a = SearchResponse.bind;
                        return [4 /*yield*/, response.json()];
                    case 2: return [2 /*return*/, new (_a.apply(SearchResponse, [void 0, _b.sent()]))().results];
                }
            });
        });
    };
    return DataManager;
}());



var UrlParser = /** @class */ (function () {
    function UrlParser() {
        // do nothing
    }
    // date should be in format YYYYMMDD
    UrlParser.getDate = function () {
        var url = new URL(window.location.href);
        var rawDate = url.searchParams.get("date");
        if (rawDate === null) {
            // parse instead from url: http://SOME_PATH/archive/2003/10/13.html
            var urlParts = window.location.href.split('/');
            var year_1 = urlParts[urlParts.length - 3];
            var month_1 = urlParts[urlParts.length - 2];
            var day_1 = urlParts[urlParts.length - 1].split('.')[0];
            return new CalendarDate(year_1, month_1, day_1);
        }
        var year = rawDate.substring(0, 4);
        var month = rawDate.substring(4, 6);
        var day = rawDate.substring(6);
        var date = new CalendarDate(year, month, day);
        return date;
    };
    UrlParser.getSearchRequest = function () {
        var url = new URL(window.location.href);
        var searchTerms = url.searchParams.get('search');
        if (searchTerms !== null) {
            return new SearchRequest(searchTerms.split(','));
        }
        else {
            return new SearchRequest('');
        }
    };
    return UrlParser;
}());



var GetArticleCountResponse = /** @class */ (function () {
    function GetArticleCountResponse(jsonData) {
        this.data = [];
        for (var key in jsonData) {
            this.data.push(new ArticleCountData(key, jsonData[key]));
        }
    }
    return GetArticleCountResponse;
}());
var ArticleCountData = /** @class */ (function () {
    function ArticleCountData(date, count) {
        this.count = count;
        this.date = CalendarDate.fromDateString(date);
    }
    return ArticleCountData;
}());



var SearchResponse = /** @class */ (function () {
    function SearchResponse(jsonData) {
        var _this = this;
        this.results = [];
        jsonData.forEach(function (d) {
            var article = new Article();
            article.date = CalendarDate.fromDateString(d['datePublished']);
            article.title = d['title'];
            article.subtitle = d['subtitle'];
            article.author = d['author'];
            article.url = d['url'];
            article.website = d['website'];
            article.thumbnail = d['thumbnail'];
            console.log(article);
            _this.results.push(article);
        });
    }
    return SearchResponse;
}());



var SearchRequest = /** @class */ (function () {
    function SearchRequest(searchTerms) {
        if (typeof searchTerms === 'string') {
            searchTerms = searchTerms.split(' ');
        }
        this.searchTerms = searchTerms;
    }
    return SearchRequest;
}());



var WebsiteColumn = /** @class */ (function () {
    function WebsiteColumn(websiteName, articles, paddingLeft) {
        this.websiteName = websiteName;
        this.articles = articles;
        this.paddingLeft = paddingLeft;
    }
    WebsiteColumn.prototype.toHtml = function () {
        var containerDiv = this.getWebsiteColumn();
        // if no articles for this day, just say so
        if (this.articles.length === 0) {
            var noArticles = document.createElement('p');
            noArticles.innerHTML = "No articles found for this date.";
            noArticles.classList.add('no-article-msg');
            containerDiv.appendChild(noArticles);
        }
        // otherwise, list articles
        else {
            for (var i = 0; i < this.articles.length; i++) {
                var article = this.articles[i];
                var articleDiv = this.getArticleDiv(article);
                containerDiv.appendChild(articleDiv);
            }
        }
        return containerDiv;
    };
    WebsiteColumn.prototype.getArticleDiv = function (article) {
        // create container
        var containerDiv = document.createElement("div");
        containerDiv.classList.add('article');
        // create thumbnail, if it exists
        var thumbnail = null;
        if (article.thumbnail !== null) {
            thumbnail = document.createElement('img');
            thumbnail.classList.add('article-thumbnail');
            thumbnail.src = this.getThumbnailUrl(article);
        }
        // create title
        var title = document.createElement('a');
        title.href = article.url;
        title.classList.add('article-title');
        title.innerText = article.title;
        if (thumbnail === null)
            title.style.width = '100%';
        // create subtitle
        var subtitle = document.createElement('div');
        subtitle.classList.add('article-subtitle');
        subtitle.innerText = article.subtitle;
        if (thumbnail === null)
            subtitle.style.width = '100%';
        // create author
        var author = document.createElement('div');
        author.classList.add('article-author');
        author.innerText = article.author;
        if (thumbnail === null)
            author.style.width = '100%';
        // and add everything to the container
        if (thumbnail !== null) { // don't add thumbnail if there i snone
            containerDiv.appendChild(thumbnail);
        }
        containerDiv.appendChild(title);
        if (article.subtitle !== '') { // don't add subtitle div if there is none
            containerDiv.appendChild(subtitle);
        }
        else { // and if there isn't a subtitle, add a new line (for the author)
            containerDiv.appendChild(document.createElement("br"));
        }
        if (article.author !== null) {
            containerDiv.appendChild(author);
        }
        // and return 
        return containerDiv;
    };
    WebsiteColumn.prototype.getWebsiteColumn = function () {
        var websiteColumn = document.createElement('div');
        websiteColumn.classList.add(WebsiteColumn.WEBSITE_COLUMN_CLASS);
        var label = document.createElement('span');
        label.classList.add(WebsiteColumn.WEBSITE_COLUMN_HEADER_CLASS);
        label.innerHTML = this.websiteName;
        websiteColumn.appendChild(label);
        websiteColumn.appendChild(document.createElement('hr'));
        return websiteColumn;
    };
    WebsiteColumn.prototype.getThumbnailUrl = function (article) {
        var month = Utils.getTwoCharNum(article.date.month);
        return "".concat(Config.LOCAL_FILE_BASE_URL, "/").concat(this.websiteName, "/_thumbnails/").concat(article.date.year.toString(), "/").concat(month, "/").concat(article.thumbnail);
    };
    // class declarations
    WebsiteColumn.ARTICLES_DIV_ID = 'articles';
    WebsiteColumn.WEBSITE_COLUMN_CLASS = 'news-site-column';
    WebsiteColumn.WEBSITE_COLUMN_HEADER_CLASS = 'news-site-column-header';
    return WebsiteColumn;
}());



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
            var week, i, day, dateNumber, dayHasArticles, dayClass;
            return __generator(this, function (_a) {
                week = document.createElement('div');
                week.classList.add(Calendar.WEEK_CLASS);
                for (i = 1; i <= 7; i++) {
                    day = document.createElement('a');
                    day.classList.add(Calendar.DAY_CLASS);
                    dateNumber = (i - offset) + (weekNumber * 7);
                    // not a date, just filler
                    if (dateNumber < 1 || dateNumber > this.date.getDaysInMonth()) {
                        day.classList.remove(Calendar.DAY_CLASS);
                        day.classList.add(Calendar.DAY_NO_DATE_CLASS);
                        day.innerText = '-';
                    }
                    // add date number text
                    else {
                        dayHasArticles = this.dayHasArticles(dateNumber, articleCounts);
                        dayClass = dayHasArticles ? Calendar.DAY_LINK_ACTIVE : Calendar.DAY_LINK_INACTIVE;
                        day.classList.add(dayClass);
                        day.innerText = dateNumber.toString();
                        day.href = "/html/archive/".concat(this.date.year, "/").concat(Utils.getTwoCharNum(this.date.month), "/").concat(Utils.getTwoCharNum(dateNumber.toString()), ".html");
                    }
                    // if this is the current date, highlight it
                    if (dateNumber == this.date.day) {
                        day.id = Calendar.CURRENT_DATE_HIGHLIGHT_ID;
                    }
                    // add to week
                    week.appendChild(day);
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



var DateHeader = /** @class */ (function () {
    function DateHeader() {
        this.date = UrlParser.getDate();
    }
    DateHeader.prototype.updateHtml = function () {
        var span = document.getElementById(DateHeader.DISPLAY_SPAN_ID);
        span.innerText = this.date.toPrettyString_FullDate();
    };
    // html class declarations
    DateHeader.DISPLAY_SPAN_ID = 'date-display';
    return DateHeader;
}());



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
var SearchBar = /** @class */ (function () {
    function SearchBar() {
    }
    SearchBar.onSubmit = function (e) {
        return __awaiter(this, void 0, void 0, function () {
            var searchTerms;
            return __generator(this, function (_a) {
                searchTerms = e.target.value;
                window.location.href = "/html/searchEngine.html?search=".concat(encodeURIComponent(searchTerms));
                return [2 /*return*/];
            });
        });
    };
    SearchBar.prototype.init = function () {
        var searchBar = document.getElementById("search-bar");
        searchBar.addEventListener("keydown", function (e) {
            if (e.code === "Enter") { //checks whether the pressed key is "Enter"
                SearchBar.onSubmit(e);
            }
        });
        var searchHistory = UrlParser.getSearchRequest();
        if (searchHistory !== null) {
            searchBar.value = searchHistory.searchTerms.join(' ');
        }
    };
    return SearchBar;
}());



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
// const PADDING_BETWEEN_WEBSITE_COLUMNS = 500
var PADDING_BETWEEN_WEBSITE_COLUMNS = 0;
var NUM_WEBSITES = 6;
var dataManager = new DataManager();
var calendar = new Calendar();
var dateHeader = new DateHeader();
var searchBar = new SearchBar();
function appendMagazinePOC() {
    return __awaiter(this, void 0, void 0, function () {
        var currentDate, full_issue, articles, data, magazineColumn;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    currentDate = UrlParser.getDate();
                    full_issue = new Article();
                    full_issue.date = new CalendarDate(1993, 10, 1);
                    full_issue.title = 'Edge, Issue 1';
                    full_issue.subtitle = '';
                    full_issue.author = null;
                    full_issue.thumbnail = 'Edge_001_FullIssue_thumbnail.jpg';
                    full_issue.url = "".concat(Config.LOCAL_FILE_BASE_URL, "/Edge/1993/10/Edge_001_FullIssue.pdf");
                    articles = [];
                    if (!(currentDate.year === 1993 && currentDate.month === 10 && currentDate.day === 1)) return [3 /*break*/, 3];
                    articles.push(full_issue);
                    return [4 /*yield*/, fetch("/test/Edge_1.json")];
                case 1:
                    data = _a.sent();
                    return [4 /*yield*/, data.json()];
                case 2:
                    data = _a.sent();
                    data['articles'].forEach(function (a) {
                        var article = new Article();
                        article.date = full_issue.date;
                        article.title = a['title'];
                        article.subtitle = a['subtitle'];
                        article.author = null;
                        article.thumbnail = null;
                        article.url = "".concat(Config.LOCAL_FILE_BASE_URL, "/Edge/1993/10/Edge_001_p").concat(Utils.getThreeCharNum(a["start_page"]), "_").concat(Utils.getNormalizedMagazineTitle(a["title"]), ".pdf");
                        articles.push(article);
                    });
                    _a.label = 3;
                case 3:
                    magazineColumn = new WebsiteColumn('Edge', articles, 0);
                    document.getElementById('articles').appendChild(magazineColumn.toHtml());
                    return [2 /*return*/];
            }
        });
    });
}
// async function initPage() {
//     let articles = await dataManager.getArticlesForDayAsync(UrlParser.getDate());
//     let websites = {
//         'GameSpot': [],
//         'Eurogamer': [],
//         'Gameplanet': [], 
//         'JayIsGames': [],
//         'TIGSource': [],
//         'Indygamer': []
//     };
//     for(let i = 0; i < articles.length; i++) {
//         websites[articles[i].website].push(articles[i]);
//     }
//     let articlesDiv = document.getElementById('articles');
//     for(let i = 0; i < NUM_WEBSITES; i++) {
//         let websiteName = Config.websiteIdToName(i + 1);
//         let paddingLeft = PADDING_BETWEEN_WEBSITE_COLUMNS * i;
//         let websiteArticles = websites[websiteName];
//         let websiteColumn = new WebsiteColumn(websiteName, websiteArticles, paddingLeft);
//         articlesDiv.appendChild(websiteColumn.toHtml());
//     }
//     await appendMagazinePOC();
// }
// buttons for the day
function goToNextDay() {
    var targetDate = UrlParser.getDate();
    targetDate.addDay();
    goToTargetDate(targetDate);
}
function goToPreviousDay() {
    var targetDate = UrlParser.getDate();
    targetDate.subtractDay();
    goToTargetDate(targetDate);
}
function goToTargetDate(targetDate) {
    window.location.href = "/html/archive/".concat(targetDate.year, "/").concat(targetDate.month, "/").concat(targetDate.day, ".html");
}
// calendar button functions
function goToNextCalendarMonth() {
    calendar.goToNextMonth();
}
function goToNextCalendarYear() {
    calendar.goToNextYear();
}
function goToPreviousCalendarMonth() {
    calendar.goToPreviousMonth();
}
function goToPreviousCalendarYear() {
    calendar.goToPreviousYear();
}
// initPage();
// on window load
(function (window, document, undefined) {
    window.onload = init;
    function init() {
        dateHeader.updateHtml();
        calendar.updateHtml();
        searchBar.init();
    }
})(window, document, undefined);
