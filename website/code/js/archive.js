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
