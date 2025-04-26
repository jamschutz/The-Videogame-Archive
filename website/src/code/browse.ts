import { Filter } from "./utils/Filter";
import { CalendarDate } from './entities/CalendarDate';
const config = require('config');

var filter = new Filter(false);  // false means don't load rules from cache -- we're rebuilding here!

var filterInput: HTMLInputElement;
var filterTypeSelection: HTMLInputElement;
var includeExcludeSelection: HTMLInputElement;
var addFilterButton: HTMLInputElement;

async function onSubmit() {
    // build json body
    let body = filter.toJson();

    // get dates from api
    let response = await fetch(`${config.API_BASE_URL}/GetDatesByFilter`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    let json = await response.json();

    // save data to cache
    saveAndRedirect(json);
}

// separate function for this, so that it's synchonous and waits for storage to update
function saveAndRedirect(json: any) {
    sessionStorage['targetDates'] = json;
    filter.saveRules();
    let targetDate = CalendarDate.fromDateString(json[0]);
    window.location.href = `/${targetDate.year}/${targetDate.month}/${targetDate.day}`;
}


function onAddFilter() {
    // parse data
    let isInclude = includeExcludeSelection.value === 'include';
    let filterType: string = filterTypeSelection.value;
    let filterTerm = filterInput.value;
    let id = `Browse-${filterType}${filterTerm}`;

    // save data
    saveFilter(isInclude, filterType, filterTerm);

    // create html element
    let container = document.getElementById('Browse-filterCriteriaContainer');

    let criteriaEl = document.createElement('div');
    criteriaEl.classList.add('Browse-filterCriteria');
    criteriaEl.id = id;
    criteriaEl.setAttribute('data-include', isInclude.toString());
    criteriaEl.setAttribute('data-type', filterType);
    criteriaEl.setAttribute('data-value', filterTerm);

    let deleteBtn = document.createElement('button');
    deleteBtn.classList.add('Browse-filterCriteriaDeleteBtn');
    deleteBtn.innerText = '🗙';
    deleteBtn.addEventListener('click', () => deleteFilter(id));

    let description = document.createElement('div');
    description.classList.add('Browse-filterCriteriaDescription');

    let label = document.createElement('b');
    label.innerText = `${isInclude? 'include' : 'exclude'} ${filterType}`;

    let term = document.createTextNode(`: ${filterTerm}`);

    description.appendChild(label);
    description.appendChild(term);

    criteriaEl.appendChild(deleteBtn);
    criteriaEl.appendChild(description);

    container?.appendChild(criteriaEl);
}


function updateBrowseByTypeSelection(selection: string) {
    filterInput.setAttribute('list', `datalist-${selection}`);
}


function saveFilter(isInclude: boolean, filterType: string, filterTerm: string) {
    filterType = filterType.toLowerCase();
    switch(filterType) {
        case 'websites':
            if(isInclude) filter.includeWebsite(filterTerm);
            else          filter.excludeWebsite(filterTerm);
            break;
        case 'authors':
            if(isInclude) filter.includeAuthor(filterTerm);
            else          filter.excludeAuthor(filterTerm);
            break;
        case 'articleTypes':
            if(isInclude) filter.includeArticleType(filterTerm);
            else          filter.excludeArticleType(filterTerm);
            break;
        default:
            console.error(`unknown filter type: ${filterType}`);
            break;
    }
    
}


function deleteFilter(elementId: string) {
    let element = document.getElementById(elementId);
    if(element == null || element == undefined) {
        console.error(`unable to find element with id: ${elementId}`);
        return;
    }

    let isInclude = element.getAttribute('data-include') == 'true';
    let filterType = element.getAttribute('data-type');
    let filterValue = element.getAttribute('data-value');

    if(filterType == null || filterValue == null) {
        console.error(`unable to get data from filter element with id ${elementId}`);
        return;
    }

    document.getElementById(elementId)?.remove();
    filter.deleteRule(filterValue, filterType, isInclude);
}


// on window load
const dataLoadPromise = filter.loadData();
(function(window, document, undefined) {  
    window.onload = init;
  
    async function init(){
        // find and store input elements
        filterInput = document.getElementById('Browse-filterInput') as HTMLInputElement;
        includeExcludeSelection = document.getElementById('Browse-includeExclude') as HTMLInputElement;        
        filterTypeSelection = document.getElementById("Browse-browseBySelect") as HTMLInputElement;
        addFilterButton = document.getElementById('Browse-addFilter') as HTMLInputElement;
        let submitButton = document.getElementById("Browse-submitBtn") as HTMLInputElement;

        // add event listeners
        filterTypeSelection.addEventListener("change", function (e: any) {
            updateBrowseByTypeSelection(e.target.value);
        });
        addFilterButton.addEventListener("click", onAddFilter);
        submitButton.addEventListener("click", onSubmit);

        await dataLoadPromise;
    }
})(window, document, undefined);