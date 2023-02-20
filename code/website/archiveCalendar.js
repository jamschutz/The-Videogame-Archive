const TITLE_ID = 'calendar-title'
const CALENDAR_ID = 'calendar-dates'

var _month = 12;
var _day = 1;
var _year = 1999


function incrementCalendarMonth() {
    let dayNumber = parseInt(_day);
    let monthNumber = parseInt(_month);
    let yearNumber = parseInt(_year);

    // always safe
    if(monthNumber < 12) {
        monthNumber++;
    }
    // go to next year
    else {
        yearNumber++;
        monthNumber = 1;
    }

    // fix day if needed
    if(dayNumber > getMaxDayForMonth(monthNumber)) {
        dayNumber = getMaxDayForMonth(monthNumber);
    }

    let d = intToString(dayNumber);
    let m = intToString(monthNumber);
    let y = intToString(yearNumber);

    updateCalendar(m, d, y);
}


function decrementCalendarMonth() {
    let dayNumber = parseInt(_day);
    let monthNumber = parseInt(_month);
    let yearNumber = parseInt(_year);

    // always safe
    if(monthNumber > 1) {
        monthNumber--;
    }
    // roll back the year
    else {
        yearNumber--;
        monthNumber = 12;
    }

    // fix day if needed
    if(dayNumber > getMaxDayForMonth(monthNumber)) {
        dayNumber = getMaxDayForMonth(monthNumber);
    }

    let d = intToString(dayNumber);
    let m = intToString(monthNumber);
    let y = intToString(yearNumber);

    updateCalendar(m, d, y);
}


function updateCalendar(month, day, year) {
    let daysInMonth  = getMaxDayForMonth(month);
    let weeksInMonth = daysInMonth / 7;
    let monthString = monthNumberToString(month);

    console.log('updating calendar with ' + daysInMonth + ' days in month');

    _month = month;
    _date = day;
    _year = year;
    
    // clear calendar
    let calendar = document.getElementById(CALENDAR_ID)
    calendar.innerHTML = "";

    // set title
    let title = monthString + ', ' + year;
    document.getElementById(TITLE_ID).innerHTML = title;

    // set days
    for(let week = 0; week <= weeksInMonth; week++) {
        // create new week div
        let weekDiv = document.createElement("div");
        weekDiv.classList.add('week');

        // create a new day div and add to week
        for(let day = 1; day <= 7 && (week * 7) + day <= daysInMonth; day++) {
            let dayDiv = document.createElement('a');
            dayDiv.classList.add('day');

            let date = (week * 7) + day;

            let dateString = _month + '/' + intToString(date) + '/' + _year;
            dayDiv.onclick = function() {
                goToDate(dateString);
            }

            dayDiv.classList.add(articlesExistOnDate(dateString)? 'link-active' : 'link-inactive');

            dayDiv.innerHTML = date;
            weekDiv.appendChild(dayDiv);
        }

        // add week to calendar
        calendar.appendChild(weekDiv);
    }
}