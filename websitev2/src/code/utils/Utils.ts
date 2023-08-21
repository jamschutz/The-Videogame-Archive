class Utils {
    constructor() {
        // do nothing
    }


    static getTwoCharNum(n: string);
    static getTwoCharNum(n: number);
    static getTwoCharNum(n: string | number): string {
        // make sure n is a number
        if(typeof n === 'string') {
            n = parseInt(n);
        }

        if(n < 10) {
            return `0${n.toString()}`;
        }
        else {
            return n.toString();
        }
    }


    static getThreeCharNum(n: string);
    static getThreeCharNum(n: number);
    static getThreeCharNum(n: string | number): string {
        // make sure n is a number
        if(typeof n === 'string') {
            n = parseInt(n);
        }

        if(n < 10) {
            return `00${n.toString()}`;
        }
        else if(n < 100) {
            return `0${n.toString()}`;
        }
        else {
            return n.toString();
        }
    }


    static getNormalizedMagazineTitle(title: string): string {
        let titleComponents = title.split(' ');
        titleComponents.forEach(c => {
            c = c.replace('/[^0-9A-Z]+/gi', "");
        });
        
        return titleComponents.join('_');
    }
}