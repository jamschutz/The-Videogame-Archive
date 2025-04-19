
export class Utils {
    constructor() {
        // do nothing
    }


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


    static url_to_filename(url: string, day: string, websiteId: number): string {
        let filename = '';

        // gamespot has a different file naming convention
        if(websiteId === 1) {
            // convert https://example.com/something/TAKE_THIS_PART
            filename = `${day}_${url.split("/").slice(4).join("_")}`;
        }
        else {
            // convert https://www.eurogamer.net/TAKE_THIS_PART
            filename = `${day}_${url.split("/").slice(3).join("_")}`;
        }

        // if it has url parameters, remove them
        if(url.indexOf('?') > -1) {
            filename = filename.substring(0, url.indexOf('?'));
        }

        // if ends in underscore, remove it
        if(filename[filename.length - 1] === "_") {
            filename = filename.slice(0, filename.length - 1);
        }

        return filename;
    }
}