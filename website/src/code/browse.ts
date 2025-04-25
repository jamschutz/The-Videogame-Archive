import { DataManager } from "./utils/DataManager";
const config = require('config');

var dataManager = new DataManager();

var filterInput: HTMLInputElement;
var filterTypeSelection: HTMLInputElement;
var includeExcludeSelection: HTMLInputElement;
var addFilterButton: HTMLInputElement;

var include: any = {
    'websites': [],
    'authors': [],
    'articleTypes': []
}
var exclude: any = {
    'websites': [],
    'authors': [],
    'articleTypes': []
}

async function onSubmit() {
    let body = { 
        'include': include,
        'exclude': exclude
    };
    console.log(JSON.stringify(body));
    let response = await fetch(`${config.API_BASE_URL}/GetDatesByFilter`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    let json = await response.json();
    console.log(json);
}


function onAddFilter() {
    // parse data
    let isInclude = includeExcludeSelection.value === 'include';
    let filterType: string = filterTypeSelection.value;
    let filterTerm = filterInput.value;
    let id = `Browse-${filterType}${filterTerm}`;

    // save data
    saveFilter(isInclude? include : exclude, filterType, filterTerm);

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


function saveFilter(d: any, filterType: string, filterTerm: string) {
    filterType = filterType.toLowerCase();
    if(filterType === 'website') {
        d['websites'].push(dataManager.getWebsiteId(filterTerm));
    }
    else if(filterType === 'author') {
        d['authors'].push(dataManager.getAuthorId(filterTerm));
    }
    else if(filterType === 'articleType') {
        d['articleTypes'].push(dataManager.getArticleTypeId(filterTerm));
    }
    else {
        console.error(`unknown filterType: ${filterType}`);
        return;
    }
}


function deleteFilter(elementId: string) {
    let element = document.getElementById(elementId);
    let isInclude = element?.getAttribute('data-include') == 'true';
    let filterType = element?.getAttribute('data-type');
    let filterValue = element?.getAttribute('data-value');

    document.getElementById(elementId)?.remove();

    let d = isInclude? include : exclude;
    let target = '';
    if(filterType === 'website') {
        target = 'websites';
    }
    else if(filterType === 'author') {
        target = 'authors';
    }
    else if(filterType === 'articleType') {
        target = 'articleTypes';
    }
    else {
        console.error(`unknown filterType: ${filterType}`);
        return;
    }
    
    let i = d[target].indexOf(filterValue);
    if(i > -1) {
        d[target].splice(i, 1);
    }
    else {
        console.log(`didn't find ${filterValue} in ${target}`)
    }
}


// on window load
const dataLoadPromise = dataManager.loadData();
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