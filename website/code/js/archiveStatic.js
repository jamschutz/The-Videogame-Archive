(function(window, document, undefined) {  
    window.onload = init;
  
    function init(){
        let searchBar = document.getElementById("search-bar");
        searchBar.addEventListener("keydown", function (e) {
            if (e.code === "Enter") {  //checks whether the pressed key is "Enter"
                onSearchSubmit(e);
            }
        });
    }
  
})(window, document, undefined);


function onSearchSubmit(e) {
    let searchTerms = e.target.value;
    window.location.href = `/html/searchEngine.html?search=${encodeURIComponent(searchTerms)}`;
}