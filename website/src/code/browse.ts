var filterInput: HTMLInputElement;
var filterTypeSelection: HTMLInputElement;
var includeExcludeSelection: HTMLInputElement;
var addFilterButton: HTMLInputElement;
var submitButton: HTMLInputElement;

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

function onSubmit() {
    // to do....
}


function onAddFilter() {
    // parse data
    let isInclude = includeExcludeSelection.value === 'include';
    let filterType: string = filterTypeSelection.value;
    let filterTerm = filterInput.value;
    let id = `Browse-${filterType}${filterTerm}`;

    // save data
    saveFilter(isInclude? include : exclude, filterType, filterTerm);
    console.log(include);
    console.log(exclude);

    // create html element
    let container = document.getElementById('Browse-filterCriteriaContainer');

    let criteriaEl = document.createElement('div');
    criteriaEl.classList.add('Browse-filterCriteria');
    criteriaEl.id = id;

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
        d['websites'].push(filterTerm);
    }
    else if(filterType === 'author') {
        d['authors'].push(filterTerm);
    }
    else if(filterType === 'articleType') {
        d['articleTypes'].push(filterTerm);
    }
    else {
        console.error(`unknown filterType: ${filterType}`);
        return;
    }
}


function deleteFilter(elementId: string) {

}


// on window load
(function(window, document, undefined) {  
    window.onload = init;
  
    async function init(){
        // find and store input elements
        filterInput = document.getElementById('Browse-filterInput') as HTMLInputElement;
        includeExcludeSelection = document.getElementById('Browse-includeExclude') as HTMLInputElement;        
        filterTypeSelection = document.getElementById("Browse-browseBySelect") as HTMLInputElement;
        addFilterButton = document.getElementById('Browse-addFilter') as HTMLInputElement;
        // let submitButton = document.getElementById("Browse-submitBtn") as HTMLInputElement;

        // add event listeners
        filterTypeSelection.addEventListener("change", function (e: any) {
            updateBrowseByTypeSelection(e.target.value);
        });
        addFilterButton.addEventListener("click", onAddFilter);
    }
})(window, document, undefined);