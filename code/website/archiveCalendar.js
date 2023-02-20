const TITLE_ID = 'calendar-title'
const CALENDAR_ID = 'calendar-month'


function updateCalendar(month, day, year) {
    let daysInMonth  = getMaxDayForMonth(month);
    let weeksInMonth = daysInMonth / 7;
    let monthString = monthNumberToString(month);

    // set title
    let title = monthString + ', ' + year;
    document.getElementById(TITLE_ID).innerHTML = title;

    // set days
    let calendar = document.getElementById(CALENDAR_ID)
    for(let week = 0; week <= weeksInMonth; week++) {
        // create new week div
        let weekDiv = document.createElement("div");
        weekDiv.classList.add('week');

        // create a new day div and add to week
        for(let day = 1; day <= 7 && (week * 7) + day <= daysInMonth; day++) {
            let dayDiv = document.createElement('a');
            dayDiv.classList.add('day');

            let date = (week * 7) + day;

            let dateString = intToString(date);
            // var goToDayEvent = function() {
            //     goToDay(dateString);
            // }
            dayDiv.onclick = function() {
                goToDay(dateString);
            }

            dayDiv.innerHTML = date;
            weekDiv.appendChild(dayDiv);
        }

        // add week to calendar
        calendar.appendChild(weekDiv);
    }
}