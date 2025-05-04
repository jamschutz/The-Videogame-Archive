import { warn } from "console";
import { DataManager } from "./DataManager";

export class FilterRules {
    private websites: Set<number>;
    private authors: Set<number>;
    private articleTypes: Set<number>;

    constructor() {
        this.websites = new Set();
        this.authors = new Set();
        this.articleTypes = new Set();
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
            website = DataManager.getWebsiteId(website);
        }

        this.websites.add(website);
    }

    public addAuthor(author: string | number) {
        if(typeof author === 'string') {
            author = DataManager.getAuthorId(author);
        }

        this.authors.add(author);
    }
    
    public addArticleType(articleType: string | number) {
        if(typeof articleType === 'string') {
            articleType = DataManager.getArticleTypeId(articleType);
        }

        this.articleTypes.add(articleType);
    }



    public addAllWebsites() {
        DataManager.getWebsites().forEach(w => this.websites.add(w.id));
    }
    
    public addAllAuthors() {
        DataManager.getAuthors().forEach(a => this.authors.add(a.id));
    }

    public addAllArticleTypes() {
        DataManager.getArticleTypes().forEach(a => this.articleTypes.add(a.id));
    }


    // --- delete methods -------------------------------------
    // --------------------------------------------------------
    public removeWebsite(website: string | number) {
        if(typeof website === 'string') {
            website = DataManager.getWebsiteId(website);
        }

        this.websites.delete(website);
    }

    public removeAuthor(author: string | number) {
        if(typeof author === 'string') {
            author = DataManager.getAuthorId(author);
        }

        this.authors.delete(author);
    }
    
    public removeArticleType(articleType: string | number) {
        if(typeof articleType === 'string') {
            articleType = DataManager.getArticleTypeId(articleType);
        }

        this.articleTypes.delete(articleType);
    }



    public removeAllWebsites() {
        DataManager.getWebsites().forEach(w => this.websites.delete(w.id));
    }
    
    public removeAllAuthors() {
        DataManager.getAuthors().forEach(a => this.authors.delete(a.id));
    }

    public removeAllArticleTypes() {
        DataManager.getArticleTypes().forEach(a => this.articleTypes.delete(a.id));
    }
}