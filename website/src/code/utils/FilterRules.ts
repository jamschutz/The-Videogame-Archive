import { DataManager } from "./DataManager";

export class FilterRules {
    private websites: Set<number>;
    private authors: Set<number>;
    private articleTypes: Set<number>;
    private dataManager: DataManager;

    constructor(dataManager: DataManager) {
        this.websites = new Set();
        this.authors = new Set();
        this.articleTypes = new Set();
        this.dataManager = dataManager;
    }


    // --- get methods -------------------------------------
    // -----------------------------------------------------
    public getWebsites() : Set<number> {
        return this.websites;
    }

    public getAuthors() : Set<number> {
        return this.authors;
    }

    public getArticleTypes() : Set<number> {
        return this.articleTypes;
    }

    public toJson() : string {
        return JSON.stringify({
            'websites': Array.from(this.websites),
            'authors': Array.from(this.authors),
            'articleTypes': Array.from(this.articleTypes)
        })
    }

    public loadFromJson(json: string | null) {
        if(json === null)
            return;
        
        let data = JSON.parse(json);
        this.websites = new Set(data['websites']);
        this.authors = new Set(data['authors']);
        this.articleTypes = new Set(data['articleTypes']);
    }


    // --- add methods -------------------------------------
    // -----------------------------------------------------
    public addWebsite(website: string | number) {
        if(typeof website === 'string') {
            website = this.dataManager.getWebsiteId(website);
        }

        this.websites.add(website);
    }

    public addAuthor(author: string | number) {
        if(typeof author === 'string') {
            author = this.dataManager.getAuthorId(author);
        }

        this.authors.add(author);
    }
    
    public addArticleType(articleType: string | number) {
        if(typeof articleType === 'string') {
            articleType = this.dataManager.getArticleTypeId(articleType);
        }

        this.articleTypes.add(articleType);
    }


    // --- delete methods -------------------------------------
    // --------------------------------------------------------
    public removeWebsite(website: string | number) {
        if(typeof website === 'string') {
            website = this.dataManager.getWebsiteId(website);
        }

        this.websites.delete(website);
    }

    public removeAuthor(author: string | number) {
        if(typeof author === 'string') {
            author = this.dataManager.getAuthorId(author);
        }

        this.authors.delete(author);
    }
    
    public removeArticleType(articleType: string | number) {
        if(typeof articleType === 'string') {
            articleType = this.dataManager.getArticleTypeId(articleType);
        }

        this.articleTypes.delete(articleType);
    }
}