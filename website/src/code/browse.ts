var searchBar: HTMLElement;

function onSubmit() {
    let searchBar = document.getElementById("Global-searchBar") as HTMLInputElement;
    let keywords = searchBar.value.trim();
    if(keywords.length === 0)
        return;
    
    window.location.href = `/search/?term=${keywords}`;
}


function updateBrowseByTypeSelection(selection: string) {
    searchBar.setAttribute('list', `datalist-${selection}`);
}


// on window load
(function(window, document, undefined) {  
    window.onload = init;
  
    async function init(){
        // let searchBtn = document.getElementById("Global-searchBarBtn") as HTMLInputElement;
        // searchBtn.addEventListener("click", onSubmit);

        searchBar = document.getElementById('Global-searchBar') as HTMLInputElement;
        
        let browseByTypeSelection = document.getElementById("Browse-browseBySelect") as HTMLInputElement;
        browseByTypeSelection.addEventListener("change", function (e: any) {
            updateBrowseByTypeSelection(e.target.value);
        });
    }
})(window, document, undefined);