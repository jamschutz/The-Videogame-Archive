class SearchResult {
    public article: Article;

    constructor(article: Article) {
        this.article = article;
    }

    // class declarations
    static CONTAINER_DIV_ID = 'container';


    public toHtml(): HTMLElement {
        // create container
        let containerDiv = document.createElement("div");
        containerDiv.classList.add('article');
        
        containerDiv.appendChild(this.getDateWebsiteInfo());
        containerDiv.appendChild(this.getMainInfo());

        return containerDiv;
    }


    private getDateWebsiteInfo(): HTMLElement {
        // create container
        let containerDiv = document.createElement('div');
        containerDiv.classList.add('article-date-website-panel');

        // website label
        let websiteLabel = document.createElement('div');
        websiteLabel.innerText = this.article.website;

        // date
        let year = this.article.date.split('/')[2];
        let month = this.article.date.split('/')[0];
        let day = this.article.date.split('/')[1];

        let dateLabel = document.createElement('div');
        let dateInfo = new CalendarDate(year, month, day);
        dateLabel.innerText = dateInfo.toPrettyString_FullDate();
        dateLabel.classList.add('article-date-website-panel-date');

        // add it all and return
        containerDiv.appendChild(dateLabel);
        containerDiv.appendChild(websiteLabel);

        return containerDiv;
    }


    private getMainInfo(): HTMLElement {
        // create container
        let containerDiv = document.createElement("div");
        containerDiv.classList.add('article-main-info');

        // create thumbnail
        let thumbnail = document.createElement("img");
        thumbnail.classList.add('article-thumbnail');

        let thumbnailSrc = this.getThumbnailUrl();
        thumbnail.src = `${thumbnailSrc}.jpg`;
        thumbnail.onerror = function() {
            let fileExtension = this.src.split(".")[this.src.split(".").length - 1];

            if(fileExtension === 'jpg') {
                this.src= `${thumbnailSrc}.png`;
            }
            else {
                this.onerror=null;
                this.parentNode.removeChild(this);
            }
        }

        // create title
        let title = document.createElement('a');
        title.href = this.article.url;
        title.classList.add('article-title');
        title.innerText = this.article.title;

        // create subtitle
        let subtitle = document.createElement('div');
        subtitle.classList.add('article-subtitle');
        subtitle.innerText = this.article.subtitle;

        // create author
        let author = document.createElement('div');
        author.classList.add('article-author');
        author.innerText = this.article.author;

        // and add everything to the container
        containerDiv.appendChild(thumbnail);
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
        let day = Utils.getTwoCharNum(this.article.date.split("/")[1]);
        let month = Utils.getTwoCharNum(this.article.date.split("/")[0]);
        let year = Utils.getTwoCharNum(this.article.date.split("/")[2]);
        let websiteId = Config.websiteNameToId(this.article.website);

        let filename = Config.url_to_filename(this.article.url, day, websiteId) + "_thumbnail";
        return `${Config.LOCAL_FILE_BASE_URL}/${this.article.website}/_thumbnails/${year}/${month}/${filename}`;
    }
}