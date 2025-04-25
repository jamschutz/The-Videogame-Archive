import { FilterRules } from './FilterRules';
import { DataManager } from "./DataManager";

export class Filter {
    private dataManager: DataManager;

    private include: FilterRules;
    private exclude: FilterRules;

    constructor() {
        this.dataManager = new DataManager();
        this.include = new FilterRules(this.dataManager);
        this.exclude = new FilterRules(this.dataManager);

        if('dataFilters' in localStorage) {
            console.log('found rules!');
            // this.rules = localStorage['dataFilters'];
            // console.log(this.rules);
        }
    }


    // ----- public methods -------------------- //
    // ----------------------------------------- //
    public includeWebsite(name: string) {
        this.include.addWebsite(name);
    }
    public includeAuthor(name: string) {
        this.include.addAuthor(name);
    }
    public includeArticleType(name: string) {
        this.include.addArticleType(name);
    }


    public excludeWebsite(name: string) {
        this.exclude.addWebsite(name);
    }
    public excludeAuthor(name: string) {
        this.exclude.addAuthor(name);
    }
    public excludeArticleType(name: string) {
        this.exclude.addArticleType(name);
    }


    public deleteRule(rule: string, category: string, include: boolean) {
        let target = include? this.include : this.exclude;
        switch(category) {
            case "websites":
                target.removeWebsite(rule);
                break;
            case "authors":
                target.removeAuthor(rule);
                break;
            case "websites":
                target.removeArticleType(rule);
                break;
            default:
                console.error(`unknown category: ${category}`);
                break;
        }
    }

    public saveRules() {
        // localStorage['dataFilters'] = this.rules;
    }

    public getWebsiteIds() {
        
    }




    // ----- private methods -------------------- //
    // ------------------------------------------ //
    private getData(includes: Set<number>, excludes: Set<number>, type: string) : Array<number> {
        let data = new Set<number>();

        // first, build list by checking includes
        // if anything is listed in include, then this is our starting list
        if(includes.size > 0) {
            for(let id of includes) {
                data.add(id);
            }
        }
        // otherwise, we'll set it to having *all* websites
        else {
            let all = [];
            switch(type) {
                case 'websites':
                    all = this.dataManager.getWebsites();
                    break;
                case 'authors':
                    all = this.dataManager.getAuthors();
                    break;
                case 'articleTypes':
                    all = this.dataManager.getArticleTypes();
                    break;
                default:
                    console.error(`unknown filter type: ${type}`);
                    return [];
            }

            data = new Set(all.map(x => x.id));
        }

        // now, remove anything we asked to exclude
        for(let id of excludes) {
            data.delete(id);
        }

        return Array.from(data);
    }

    // private exclude(id: number, arr: Array<number> | null, type: string) {
    //     if(arr === null) {
    //         var all = []
    //         switch(type) {
    //             case 'websites':
    //                 all = this.dataManager.getWebsites();
    //                 break;
    //             case 'authors':
    //                 all = this.dataManager.getAuthors();
    //                 break;
    //             case 'articleTypes':
    //                 all = this.dataManager.getArticleTypes();
    //                 break;
    //             default:
    //                 console.error(`unknown filter type: ${type}`);
    //                 return;
    //         }

    //         arr = all.map(e => e.id);
    //     }

    //     let targetIndex = arr.indexOf(id);
    //     if(targetIndex > -1) {
    //         arr.splice(targetIndex, 1);
    //     }
    //     else {
    //         console.error(`didn't find ${id} in ${type} filters`);
    //     }
    // }
}