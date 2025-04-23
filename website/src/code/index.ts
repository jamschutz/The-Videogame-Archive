
// on window load
(function(window, document, undefined) {  
    window.onload = init;
  
    async function init(){
        let searchBtn = document.getElementById("Global-searchBarBtn") as HTMLInputElement;
        searchBtn.addEventListener("click", function () {
            window.location.href = `/`;
        });
    }
})(window, document, undefined);