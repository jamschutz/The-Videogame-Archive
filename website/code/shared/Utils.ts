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
}