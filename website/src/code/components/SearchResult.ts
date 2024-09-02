import { Utils } from "../utils/Utils";
import { Config } from "../utils/Config";
import { Article } from "../entities/Article";

export class SearchResult {
    public article: Article;

    constructor(article: Article) {
        this.article = article;
    }

    // class declarations
    static RESULTS_CONTAINER_ID = 'Search-resultsContainer';


    public toHtml(): HTMLElement {
        // create container
        let containerDiv = document.createElement("div");
        containerDiv.classList.add('Search-article');
        
        containerDiv.appendChild(this.getDateWebsiteInfo());
        containerDiv.appendChild(this.getMainInfo());

        return containerDiv;
    }


    private getDateWebsiteInfo(): HTMLElement {
        // create container
        let containerDiv = document.createElement('div');
        containerDiv.classList.add('Search-articleInfoLeftPanel');

        // website label
        let websiteLabel = document.createElement('div');
        websiteLabel.innerText = this.article.website;

        // date
        let dateLabel = document.createElement('div');
        dateLabel.innerText = this.article.date.toPrettyString_FullDate();
        dateLabel.classList.add('Search-articleDate');

        // add it all and return
        containerDiv.appendChild(dateLabel);
        containerDiv.appendChild(websiteLabel);

        return containerDiv;
    }


    private getMainInfo(): HTMLElement {
        // create container
        let containerDiv = document.createElement("div");
        containerDiv.classList.add('Search-articleMainInfo');

        // create thumbnail, if it exists
        let thumbnail = null;
        if(this.article.thumbnail !== null) {
            thumbnail = document.createElement('a');
            thumbnail.href = this.article.url;

            let thumbnailImg = document.createElement("img");
            thumbnailImg.classList.add('Search-articleThumbnail');
            let month = Utils.getTwoCharNum(this.article.date.month);
            thumbnailImg.src = `${Config.LOCAL_FILE_BASE_URL}/${this.article.website}/_thumbnails/${this.article.date.year}/${month}/${this.article.thumbnail}`;
            thumbnail.appendChild(thumbnailImg);
        }

        // create title
        let title = document.createElement('a');
        title.href = this.article.url;
        title.classList.add('Search-articleTitle');
        title.innerText = this.article.title;
        if(thumbnail === null) title.style.width = '100%';

        // create subtitle
        let subtitle = document.createElement('div');
        subtitle.classList.add('Search-articleSubtitle');
        subtitle.innerText = this.article.subtitle;
        if(thumbnail === null) subtitle.style.width = '100%';

        // create author
        let author = document.createElement('div');
        author.classList.add('Search-articleAuthor');
        author.innerText = this.article.author;
        if(thumbnail === null) author.style.width = '100%';

        // and add everything to the container
        if(thumbnail !== null) { // don't add thumbnail if there is none
            containerDiv.appendChild(thumbnail);
        }
        containerDiv.appendChild(title);
        if(this.article.subtitle !== '') { // don't add subtitle div if there is none
            containerDiv.appendChild(subtitle);
        }
        else { // and if there isn't a subtitle, add a new line (for the author)
            containerDiv.appendChild(document.createElement("br"));
        }
        containerDiv.appendChild(author);

        // and return 
        return containerDiv;
    }


    private getThumbnailUrl() {
        let day = Utils.getTwoCharNum(this.article.date.day);
        let month = Utils.getTwoCharNum(this.article.date.month);
        let year = Utils.getTwoCharNum(this.article.date.year);
        let websiteId = Utils.websiteNameToId(this.article.website);

        let filename = Utils.url_to_filename(this.article.url, day, websiteId) + "_thumbnail";
        return `${Config.LOCAL_FILE_BASE_URL}/${this.article.website}/_thumbnails/${year}/${month}/${filename}`;
    }
}