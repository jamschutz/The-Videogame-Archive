function getRandomDate() {
    let start = new Date(1996, 5, 1);
    let end = new Date(2022, 12, 31);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}


// on window load
(function(window, document, undefined) {  
    window.onload = init;
  
    async function init(){
        let goToRandomDateBtn = document.getElementById("Index-goToRandomDate") as HTMLInputElement;
        goToRandomDateBtn.addEventListener("click", function () {
            let start = new Date(1996, 5, 1);
            let end = new Date(2022, 12, 31);
            let targetDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
            window.location.href = `/${targetDate.getFullYear()}/${targetDate.getMonth() + 1}/${targetDate.getDate()}`;
        });
    }
})(window, document, undefined);