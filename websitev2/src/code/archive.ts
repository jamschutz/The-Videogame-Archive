import { SearchBar } from "./components/SearchBar";
import { Calendar } from "./components/Calendar";
import { UrlParser } from "./utils/UrlParser";
import { CalendarDate } from "./entities/CalendarDate";

// --- declare components --- //
var searchBar = new SearchBar();
var calendar = new Calendar();
let websiteColumns: HTMLCollectionOf<Element>;
let selectedColumn: HTMLElement;



// -------------- main functions ---------------------- //

// buttons for the day
function goToNextDay() {
    let targetDate = UrlParser.getDate();
    targetDate.addDay();
    goToTargetDate(targetDate);
}
function goToPreviousDay() {
    let targetDate = UrlParser.getDate();
    targetDate.subtractDay();
    goToTargetDate(targetDate);
}
function goToTargetDate(targetDate: CalendarDate) {
    window.location.href = `/${targetDate.year}/${targetDate.month}/${targetDate.day}`;
}

// buttons for the filters
function applyFilters() {
    let websiteFilters = document.getElementsByClassName("ArticleFilters-filterCheckboxWebsites");
    let articleTypeFilters = document.getElementsByClassName("ArticleFilters-filterCheckboxArticleTypes");

    // apply website filters
    for(let i = 0; i < websiteFilters.length; i++) {
        let website = websiteFilters.item(i) as HTMLElement;
        let websiteName = website.getAttribute('name');
        if(websiteName == undefined)
            continue;
        websiteName = websiteName.trim();
        
        let websiteColumn = document.getElementById(`Archive-websiteColumn${websiteName}`);
        if(websiteColumn == undefined) {
            console.error(`unable to find website column for website: ${websiteName}`);
            continue;
        }
        websiteColumn.style.display = (website as HTMLInputElement).checked? 'block' : 'none';
    }
    
    // apply article type filters
    for(let i = 0; i < articleTypeFilters.length; i++) {
        let articleType = articleTypeFilters.item(i) as HTMLElement;
        let articleTypeName = articleType.getAttribute('name');
        if(articleTypeName == undefined)
            continue;
        articleTypeName = articleTypeName.trim();

        // hide all articles of type
        let articlesOfType = document.getElementsByClassName(`Archive-article${articleTypeName}`);
        let showArticles = (articleType as HTMLInputElement).checked;
        for(let j = 0; j < articlesOfType.length; j++) {
            let article = articlesOfType.item(j) as HTMLElement;
            article.style.display = showArticles? 'block': 'none';
        }
    }
}

// select all functions for filters
function toggleSelectAllWebsites() {
    let selectAll = (document.getElementById("ArticleFilters-websiteSelectAll") as HTMLInputElement).checked;
    let websiteFilters = document.getElementsByClassName("ArticleFilters-filterCheckboxWebsites");

    // apply website filters
    for(let i = 0; i < websiteFilters.length; i++) {
        let website = websiteFilters.item(i) as HTMLInputElement;
        website.checked = selectAll;
    }
}

function toggleSelectAllArticleTypes() {
    let selectAll = (document.getElementById("ArticleFilters-articleTypeSelectAll") as HTMLInputElement).checked;
    let articleTypeFilters = document.getElementsByClassName("ArticleFilters-filterCheckboxArticleTypes");

    // apply website filters
    for(let i = 0; i < articleTypeFilters.length; i++) {
        let articleType = articleTypeFilters.item(i) as HTMLInputElement;
        articleType.checked = selectAll;
    }
}


// moveable website columns
function handleDragStart(this: any, e: any) {
    console.log('drag start');
    selectedColumn = this.parentNode;
    selectedColumn.style.opacity = '0.4';

    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e: any) {
    selectedColumn.style.opacity = '1';
}

function handleDragOver(e : any) {
    console.log('drag over');
    e.preventDefault();
    return false;
}

function handleDragEnter(this: any, e: any) {
    console.log('drag enter');
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
    console.log('drag leave');
    e.stopPropagation(); // stops the browser from redirecting.
    return false;
}






// -------------- page init ---------------------- //
// on window load
(function(window, document, undefined) {
    window.onload = init;

    function init() {
        // init components
        searchBar.init();
        calendar.updateHtml();

        // bind forward / backward 
        let backButton = document.getElementById("Archive-articleDateBackBtn") as HTMLInputElement;
        let forwardButton = document.getElementById("Archive-articleDateForwardBtn") as HTMLInputElement;
        backButton.addEventListener("click", goToPreviousDay);
        forwardButton.addEventListener("click", goToNextDay);

        // bind apply filters button
        let applyFiltersButton = document.getElementById("ArticleFilters-applyFiltersBtn") as HTMLInputElement;
        applyFiltersButton.addEventListener("click", applyFilters);

        let selectAllWebsitesCheckbox = document.getElementById("ArticleFilters-websiteSelectAll") as HTMLInputElement;
        let selectAllArticleTypesCheckbox = document.getElementById("ArticleFilters-articleTypeSelectAll") as HTMLInputElement;
        selectAllWebsitesCheckbox.addEventListener('click', toggleSelectAllWebsites);
        selectAllArticleTypesCheckbox.addEventListener('click', toggleSelectAllArticleTypes);

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
    }
})(window, document, undefined)