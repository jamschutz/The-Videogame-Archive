import { FilterRules } from './FilterRules';
import { DataManager } from "./DataManager";
const config = require('config');


enum FilterTypes {
    Websites,
    Authors,
    ArticleTypes
}

export class Filter {
    private dataManager: DataManager;

    private include: FilterRules;
    private exclude: FilterRules;

    

    constructor(loadRulesFromCache: boolean) {
        this.dataManager = new DataManager();
        this.include = new FilterRules(this.dataManager);
        this.exclude = new FilterRules(this.dataManager);

        if(loadRulesFromCache && config.FILTER_CACHE_ID in sessionStorage) {
            let cache = sessionStorage.getItem(config.FILTER_CACHE_ID);
            this.include.loadFromJson(cache);
            console.log(this.toJson());
        }
        else if(loadRulesFromCache) {
            console.log('unable to find cache rules');
        }
    }

    public async loadData() {
        await this.dataManager.loadData();
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


    public isWebsiteActive(id: number | string) {
        if(typeof id === 'string') {
            id = this.dataManager.getWebsiteId(id);
        }
        return this.include.getWebsites().has(id);
    }
    public isAuthorActive(id: number | string) {
        if(typeof id === 'string') {
            id = this.dataManager.getAuthorId(id);
        }
        return this.include.getAuthors().has(id);
    }
    public isArticleTypeActive(id: number | string) {
        if(typeof id === 'string') {
            id = this.dataManager.getArticleTypeId(id);
        }
        return this.include.getArticleTypes().has(id);
    }


    public includeAllWebsites() {
        this.include.addAllWebsites();
    }
    public includeAllAuthors() {
        this.include.addAllAuthors();
    }
    public includeAllArticleTypes() {
        this.include.addAllArticleTypes();
    }


    public removeAllWebsites() {
        this.include.removeAllWebsites();
    }
    public removeAllAuthors() {
        this.include.removeAllAuthors();
    }
    public removeAllArticleTypes() {
        this.include.removeAllArticleTypes();
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
            case "articleTypes":
                target.removeArticleType(rule);
                break;
            default:
                console.error(`unknown category: ${category}`);
                break;
        }
    }

    
    // ------ get methods ------------------------- //
    public getWebsiteIds() {
        return this.getData(this.include.getWebsites(), this.exclude.getWebsites(), FilterTypes.Websites);
    }

    public getAuthorIds() {
        return this.getData(this.include.getAuthors(), this.exclude.getAuthors(), FilterTypes.Authors);
    }

    public getAritlceTypeIds() {
        return this.getData(this.include.getArticleTypes(), this.exclude.getArticleTypes(), FilterTypes.ArticleTypes);
    }

    public toJson() {
        return {
            'include': {
                'websites': this.getWebsiteIds(),
                'authors': this.getAuthorIds(),
                'articleTypes': this.getAritlceTypeIds()
            },
            'exclude': {
                'websites': [],
                'authors': [],
                'articleTypes': []
            }
        }
    }


    public saveRules() {
        let includeOnlyRules = new FilterRules(this.dataManager);
        
        this.getWebsiteIds().forEach(w => includeOnlyRules.addWebsite(w));
        this.getAuthorIds().forEach(a => includeOnlyRules.addAuthor(a));
        this.getAritlceTypeIds().forEach(a => includeOnlyRules.addArticleType(a));

        let pageId = window.location.href.split('/')[3];
        sessionStorage.setItem(`${config.FILTER_CACHE_ID}-${pageId}`, includeOnlyRules.toJson());
    }


    public authorExists(name: string) : boolean {
        return this.dataManager.authorExists(name);
    }




    // ----- private methods -------------------- //
    // ------------------------------------------ //
    private getData(includes: Set<number>, excludes: Set<number>, type: FilterTypes) : Array<number> {
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
                case FilterTypes.Websites:
                    all = this.dataManager.getWebsites();
                    break;
                case FilterTypes.Authors:
                    all = this.dataManager.getAuthors();
                    break;
                case FilterTypes.ArticleTypes:
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