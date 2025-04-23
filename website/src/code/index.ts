function goToSearchPage() {
    let searchBar = document.getElementById("Global-searchBar") as HTMLInputElement;
    let keywords = searchBar.value.trim();
    if(keywords.length === 0)
        return;
    
    window.location.href = `/search/?term=${keywords}`;
}


// on window load
(function(window, document, undefined) {  
    window.onload = init;
  
    async function init(){
        let searchBtn = document.getElementById("Global-searchBarBtn") as HTMLInputElement;
        searchBtn.addEventListener("click", goToSearchPage);

        
        let searchBar = document.getElementById("Global-searchBar") as HTMLInputElement;
        searchBar.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {  //checks whether the pressed key is "Enter"
                goToSearchPage();
            }
            else {
                console.log(`got key: ${e.key}`);
            }
        });
    }
})(window, document, undefined);