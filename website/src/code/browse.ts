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
var idLookups: any = {
    'websites': {},
    'authors': {},
    'articleTypes': {}
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
    idLookups[filterType][filterTerm] = getDataListItemId(filterType, filterTerm);

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
    let id = getDataListItemId(filterType, filterTerm);
    if(id < 0) {
        console.error(`unable to get for ${filterTerm}`);
        return;
    }

    d[filterType].push(id);
    
}


function getDataListItemId(category: string, value: string) : number {
    let datalist = document.getElementById(`datalist-${category}`);
    if(datalist == undefined || datalist == null) {
        console.error(`unable to find datalist with id: datalist-${category}`);
        return -1;
    }

    let items = datalist.children;
    for(let i = 0; i < items.length; i++) {
        let item = items[i] as HTMLInputElement;
        if(item.value === value) {
            let id = item.getAttribute('data-id');
            if(id == null || id == undefined)
                return -1;

            try {
                return parseInt(id);
            }
            catch {
                console.error(`got id that is not a number for ${value}: ${id}`);
                return -1;
            }
        }
    }

    console.error(`unable to find ${value} in ${category} datalist`);
    return 0;
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
    let targetId = idLookups[filterType || ''][filterValue || ''];

    if(filterType == null || filterValue == null) {
        console.error(`unable to get data from filter element with id ${elementId}`);
        return;
    }

    document.getElementById(elementId)?.remove();

    let d = isInclude? include : exclude;    
    let i = d[filterType].indexOf(targetId);
    if(i > -1) {
        d[filterType].splice(i, 1);
    }
    else {
        console.error(`didn't find ${filterValue} in ${filterType}`)
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