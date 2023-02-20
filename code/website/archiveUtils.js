function monthHas31Days(month) {
    if(month === '01') return true;
    if(month === '03') return true;
    if(month === '05') return true;
    if(month === '07') return true;
    if(month === '08') return true;
    if(month === '10') return true;
    if(month === '12') return true;

    return false;
}


function monthNumberToString(month) {
    if(month == "01") return "January";
    if(month == "02") return "February";
    if(month == "03") return "March";
    if(month == "04") return "April";
    if(month == "05") return "May";
    if(month == "06") return "June";
    if(month == "07") return "July";
    if(month == "08") return "August";
    if(month == "09") return "September";
    if(month == "10") return "October";
    if(month == "11") return "November";
    if(month == "12") return "December";

    console.error('unknown month ' + m);
    return "DATE UNKNOWN";
}


function intToString(i) {
    if(i === 1)  return '01';
    if(i === 2)  return '02';
    if(i === 3)  return '03';
    if(i === 4)  return '04';
    if(i === 5)  return '05';
    if(i === 6)  return '06';
    if(i === 7)  return '07';
    if(i === 8)  return '08';
    if(i === 9)  return '09';

    return i.toString();
}


function getMaxDayForMonth(month) {
    // february
    if(month === 2)  return 28;

    // 31 day months
    if(month === 1)  return 31;
    if(month === 3)  return 31;
    if(month === 5)  return 31;
    if(month === 7)  return 31;
    if(month === 8)  return 31;
    if(month === 10) return 31;
    if(month === 12) return 31;

    // otherwise it's 30
    return 30;
}