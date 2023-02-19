


function monthHas31Days(m) {
    if(m === '01') return true;
    if(m === '03') return true;
    if(m === '05') return true;
    if(m === '07') return true;
    if(m === '08') return true;
    if(m === '10') return true;
    if(m === '12') return true;

    return false;
}


function monthNumberToString(m) {
    if(m == "01") return "January";
    if(m == "02") return "February";
    if(m == "03") return "March";
    if(m == "04") return "April";
    if(m == "05") return "May";
    if(m == "06") return "June";
    if(m == "07") return "July";
    if(m == "08") return "August";
    if(m == "09") return "September";
    if(m == "10") return "October";
    if(m == "11") return "November";
    if(m == "12") return "December";

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
    if(m === 2)  return 28;

    // 31 day months
    if(m === 1)  return 31;
    if(m === 3)  return 31;
    if(m === 5)  return 31;
    if(m === 7)  return 31;
    if(m === 8)  return 31;
    if(m === 10) return 31;
    if(m === 12) return 31;

    // otherwise it's 30
    return 30;
}