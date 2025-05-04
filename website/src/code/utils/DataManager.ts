import { Utils } from "./Utils";
import { CalendarDate } from "../entities/CalendarDate";
import { Article } from "../entities/Article";
import { Website } from "../entities/Website";
import { ArticleType } from "../entities/ArticleType";
import { Writer } from "../entities/Writer";
import { GetArticleCountResponse } from "../responses/GetArticleCountResponse";
import { SearchRequest } from "../requests/SearchRequest";
import { SearchResponse } from "../responses/SearchResponse";
import { Filter } from "./Filter";
const config = require('config');

export class DataManager {
    private static websites : Array<Website> = [];
    private static articleTypes : Array<ArticleType> = [];
    private static authors : Array<Writer> = [];

    private static websiteLookup : any = { 'name': {}, 'id': {} };
    private static articleTypeLookup : any = { 'name': {}, 'id': {} };
    private static authorLookup : any = { 'name': {}, 'id': {} };

    constructor() {
    }

    public static async loadData() {
        // already loaded data, ignore
        if(this.websites.length > 0)
            return;

        let response = await fetch('/data/dbData.json');
        let json = await response.json();

        // load websites
        for(let index in json['websites']) {
            let website = new Website(json['websites'][index]);
            this.websites.push(website);
            this.websiteLookup['name'][website.name] = website.id;
            this.websiteLookup['id'][website.id] = website.name;
        }

        // load articleTypes
        for(let index in json['articleTypes']) {
            let articleType = new ArticleType(json['articleTypes'][index]);
            this.articleTypes.push(articleType);
            this.articleTypeLookup['name'][articleType.name] = articleType.id;
            this.articleTypeLookup['id'][articleType.id] = articleType.name;
        }

        // load authors
        for(let index in json['authors']) {
            let author = new Writer(json['authors'][index]);
            this.authors.push(author);
            this.authorLookup['name'][author.name] = author.id;
            this.authorLookup['id'][author.id] = author.name;
        }
    }

    static async getArticlesForDayAsync(date: CalendarDate): Promise<Article[]> {
        let response = await fetch(`${config.API_BASE_URL}/Articles?year=${date.year}&month=${date.month}&day=${date.day}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        let json = await response.json();

        let articles = [];
        for(let i = 0; i < json.length; i++) {
            let article = new Article();
            article.title = json[i]['title'];
            article.url = json[i]['url'];
            article.website = this.getWebsiteName(i);
            article.date = new CalendarDate(date.year, date.month, date.day);
            article.author = json[i]['author'];
            article.subtitle = json[i]['subtitle'];
            article.thumbnail = json[i]['thumbnail'];

            articles.push(article);
        }

        return articles;
    }

    static async getArticleCountBetweenDatesAsync(start: CalendarDate, end: CalendarDate): Promise<GetArticleCountResponse> {
        let response = await fetch(`${config.API_BASE_URL}/ArticleCount?start=${start.toUrlString()}&end=${end.toUrlString()}`, { 
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return new GetArticleCountResponse(await response.json());
    }

    static async getDatesWithArticles(): Promise<any> {
        // let dates = await fetch('/data/datesWithArticles.json');
        // return await dates.json();
        return [];
    }


    static async getSearchResults(searchRequest: SearchRequest, filter: Filter): Promise<SearchResponse> {
        let resultsPerPage = 25;
        let page = searchRequest.pageNumber;
        let body = {
            'searchTerms': searchRequest.searchTerms,
            'resultsPerPage': resultsPerPage,
            'page': page,
            'filter': filter.toJson().include
        }

        let response = await fetch(`${config.API_BASE_URL}/GetSearchResults`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        let results = new SearchResponse(await response.json());
        return results;
    }

    public static getWebsites() : Array<Website> {
        return this.websites;
    }

    public static getArticleTypes() : Array<ArticleType> {
        return this.articleTypes;
    }

    public static getAuthors() : Array<Writer> {
        return this.authors;
    }

    public static getWebsiteName(id: number) : string {
        return this.websiteLookup['id'][id];
    }
    public static getWebsiteId(name: string) : number {
        return this.websiteLookup['name'][name];
    }
    public static getArticleTypeName(id: number) : string {
        return this.articleTypeLookup['id'][id];
    }
    public static getArticleTypeId(name: string) : number {
        return this.articleTypeLookup['name'][name];
    }
    public static getAuthorName(id: number) : string {
        return this.authorLookup['id'][id];
    }
    public static getAuthorId(name: string) : number {
        return this.authorLookup['name'][name];
    }

    public static websiteExists(name: string) {
        return name in this.websiteLookup['name'];
    }
    public static articleTypeExists(name: string) {
        return name in this.articleTypeLookup['name'];
    }
    public static authorExists(name: string) {
        return name in this.authorLookup['name'];
    }
}