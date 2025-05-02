import { SearchBar } from "./components/SearchBar";
import { Calendar } from "./components/Calendar";
import { FilterNavBar } from "./components/FilterNavBar";
import { UrlParser } from "./utils/UrlParser";
import { DataManager } from "./utils/DataManager";
import { CalendarDate } from "./entities/CalendarDate";
import { Filter } from "./utils/Filter";
import { WebsiteColumn } from "./components/WebsiteColumn";
const config = require('config');

// --- declare components --- //
var searchBar = new SearchBar();
var calendar = new Calendar();
var dataManager = new DataManager();
var filterSettings = new Filter(true);  // true means to load from cache
let websiteColumns: HTMLCollectionOf<Element>;
let selectedColumn: HTMLElement;
var websites: Array<WebsiteColumn> = [];
var NEXT_DATE: CalendarDate | null = null;
var PREV_DATE: CalendarDate | null = null;
var nextDateButton: HTMLInputElement;
var prevDateButton: HTMLInputElement;
var filterNavBar: FilterNavBar; // wait to init until after we've initialized filters



// -------------- main functions ---------------------- //

// buttons for the day
function goToNextDay() {
    let targetDate = UrlParser.getDate();
    targetDate.addDay();
    goToTargetDate(NEXT_DATE == null? targetDate : NEXT_DATE);
}
function goToPreviousDay() {
    let targetDate = UrlParser.getDate();
    targetDate.subtractDay();
    goToTargetDate(PREV_DATE == null? targetDate : PREV_DATE);
}
function goToTargetDate(targetDate: CalendarDate) {
    saveWebsiteOrder();
    window.location.href = `/${targetDate.year}/${targetDate.month}/${targetDate.day}/`;
}


// moveable website columns
function handleDragStart(this: any, e: any) {
    selectedColumn = this.parentNode;
    selectedColumn.style.opacity = '0.4';

    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e: any) {
    selectedColumn.style.opacity = '1';
    saveWebsiteOrder();
}

function handleDragOver(e : any) {
    e.preventDefault();
    return false;
}

function handleDragEnter(this: any, e: any) {
    if (selectedColumn !== this.parentNode) {
        // swap flex order of columns
        let temp = selectedColumn.style.order;
        selectedColumn.style.order = this.parentNode.style.order;
        this.parentNode.style.order = temp;
    }
}

function handleDragLeave(e: any) {
}

function handleDrop(e: any) {
    e.stopPropagation(); // stops the browser from redirecting.
    return false;
}

function getWebsiteOrder() {
    let websiteOrder: any = {};
    let cols = document.getElementsByClassName('Archive-websiteColumn');
    for(let i = 0; i < cols.length; i++) {
        let websiteColumn = cols.item(i) as HTMLElement;
        try {
            let id = websiteColumn.getAttribute('data-id') || -1;
            let order = parseInt(websiteColumn.style.order);
            websiteOrder[id] = order;
        }
        catch {
            console.error(`unable to get id or order from website column: ${websiteColumn.classList}`);
        }
    }

    return websiteOrder;
}

function saveWebsiteOrder() {
    let websiteOrder = getWebsiteOrder();
    sessionStorage.setItem(config.WEBSITE_ORDER_CACHE_ID, JSON.stringify(websiteOrder));
}

function showActiveWebsites() {
    // load website order
    let websiteOrder = JSON.parse(sessionStorage.getItem(config.WEBSITE_ORDER_CACHE_ID) || '[]');
    console.log(websiteOrder);

    // show websites
    let allWebsites = dataManager.getWebsites();
    for(let i = 0; i < allWebsites.length; i++) {
        let order = allWebsites[i].id in websiteOrder? websiteOrder[allWebsites[i].id] : allWebsites[i].id;
        let webColumn = new WebsiteColumn(allWebsites[i], order);
        websites.push(webColumn);
        webColumn.updateHtml(filterSettings);
    }
}


function setNextAndPrevDates() {
    let targetDates = JSON.parse(sessionStorage.getItem(config.TARGET_DATES_CACHE_ID) || '[]');
    let currentDate = UrlParser.getDate();
    for(let i = 0; i < targetDates.length; i++) {
        if(targetDates[i] === currentDate.toNumber()) {
            PREV_DATE = i > 0? CalendarDate.fromDateString(targetDates[i - 1]) : null;
            NEXT_DATE = i < targetDates.length - 1? CalendarDate.fromDateString(targetDates[i + 1]) : null;

            if(PREV_DATE === null) {
                prevDateButton.style.display = 'none';
            }
            if(NEXT_DATE === null) {
                nextDateButton.style.display = 'none';
            }

            console.log(`prev: ${PREV_DATE}, next: ${NEXT_DATE}`);
            return;
        }
    }
}






// -------------- page init ---------------------- //
const dataLoadPromise = dataManager.loadData();
// on window load
(function(window, document, undefined) {
    window.onload = init;

    async function init() {
        // init components
        searchBar.init();
        calendar.updateHtml();

        await dataLoadPromise;
        await filterSettings.loadData();
        filterNavBar = new FilterNavBar(filterSettings);

        // bind forward / backward 
        prevDateButton = document.getElementById("Archive-articleDateBackBtn") as HTMLInputElement;
        nextDateButton = document.getElementById("Archive-articleDateForwardBtn") as HTMLInputElement;
        prevDateButton.addEventListener("click", goToPreviousDay);
        nextDateButton.addEventListener("click", goToNextDay);

        // bind website column draggable functions
        websiteColumns = document.getElementsByClassName('Archive-websiteColumnHeader');
        for(let i = 0; i < websiteColumns.length; i++) {
            let websiteColumn = websiteColumns.item(i) as HTMLElement;
            websiteColumn.addEventListener('dragstart', handleDragStart);
            websiteColumn.addEventListener('dragover', handleDragOver);
            websiteColumn.addEventListener('dragenter', handleDragEnter);
            websiteColumn.addEventListener('dragleave', handleDragLeave);
            websiteColumn.addEventListener('dragend', handleDragEnd);
            websiteColumn.addEventListener('drop', handleDrop);
        }
        showActiveWebsites();
        setNextAndPrevDates();
    }
})(window, document, undefined)