// --- declare components --- //
var searchBar = new SearchBar();
var calendar = new Calendar();



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
        let websiteName = website.getAttribute('name').trim();
        
        let websiteColumn = document.getElementById(`Archive-websiteColumn${websiteName}`);
        websiteColumn.style.display = (website as HTMLInputElement).checked? 'block' : 'none';
    }
    
    // apply article type filters
    for(let i = 0; i < articleTypeFilters.length; i++) {
        let articleType = articleTypeFilters.item(i) as HTMLElement;
        console.log(articleType.getAttribute('name').trim() + ': ' + (articleType as HTMLInputElement).checked);
    }
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
    }
})(window, document, undefined)