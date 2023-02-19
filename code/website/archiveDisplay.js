// You can get url_string from window.location.href if you want to work with
// the URL of the current page
var url_string = window.location.href;
var url = new URL(url_string);

var day = url.searchParams.get("day");
var month = url.searchParams.get("month");
var year = url.searchParams.get("year");
console.log('day: ' + day);
console.log('month: ' + month);
console.log('year: ' + year);