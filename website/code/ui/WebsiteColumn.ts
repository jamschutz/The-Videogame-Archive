class WebsiteColumn {
    websiteName: string;
    articles: Article[];
    paddingLeft: number;

    constructor(websiteName: string, articles: Article[], paddingLeft: number) {
        this.websiteName = websiteName;
        this.articles = articles;
        this.paddingLeft = paddingLeft;
    }

    // class declarations
    static ARTICLES_DIV_ID = 'articles';
    static WEBSITE_COLUMN_CLASS = 'news-site-column';
    static WEBSITE_COLUMN_HEADER_CLASS = 'news-site-column-header';


    public toHtml() {
        let containerDiv = this.getWebsiteColumn();
        // containerDiv.style.marginLeft = `${this.paddingLeft}px`;
        
        // if no articles for this day, just say so
        if(this.articles.length === 0) {
            let noArticles = document.createElement('p');
            noArticles.innerHTML = "No articles found for this date.";
            noArticles.classList.add('no-article-msg');

            containerDiv.appendChild(noArticles);
        }
        // otherwise, list articles
        else {
            for(let i = 0; i < this.articles.length; i++) {
                let article = this.articles[i];
                let articleDiv = this.getArticleDiv(article);
                containerDiv.appendChild(articleDiv);
            }
        }

        return containerDiv;
    }


    private getArticleDiv(article: Article) {
        // create container
        let containerDiv = document.createElement("div");
        containerDiv.classList.add('article');

        // create thumbnail
        let thumbnail = document.createElement("img");
        thumbnail.classList.add('article-thumbnail');

        let thumbnailSrc = this.getThumbnailUrl(article);
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
        title.href = article.url;
        title.classList.add('article-title');
        title.innerText = article.title;

        // create subtitle
        let subtitle = document.createElement('div');
        subtitle.classList.add('article-subtitle');
        subtitle.innerText = article.subtitle;

        // create author
        let author = document.createElement('div');
        author.classList.add('article-author');
        author.innerText = article.author;

        // and add everything to the container
        containerDiv.appendChild(thumbnail);
        containerDiv.appendChild(title);
        if(article.subtitle !== '') { // don't add subtitle div if there is none
            containerDiv.appendChild(subtitle);
        }
        else { // and if there isn't a subtitle, add a new line (for the author)
            containerDiv.appendChild(document.createElement("br"));
        }
        containerDiv.appendChild(author);

        // and return 
        return containerDiv;
    }


    private getWebsiteColumn() {
        let websiteColumn = document.createElement('div');
        websiteColumn.classList.add(WebsiteColumn.WEBSITE_COLUMN_CLASS);

        let label = document.createElement('span');
        label.classList.add(WebsiteColumn.WEBSITE_COLUMN_HEADER_CLASS);
        label.innerHTML = this.websiteName;

        // let newLine1 = document.createElement("br");
        // let newLine2 = document.createElement("br");

        websiteColumn.appendChild(label);
        websiteColumn.appendChild(document.createElement('hr'));
        // websiteColumn.appendChild(newLine1);
        // websiteColumn.appendChild(newLine2);
        
        return websiteColumn;
    }


    private getThumbnailUrl(article: Article) {
        let day = Utils.getTwoCharNum(article.date.split("/")[1]);
        let month = Utils.getTwoCharNum(article.date.split("/")[0]);
        let year = Utils.getTwoCharNum(article.date.split("/")[2]);
        let websiteId = Config.websiteNameToId(this.websiteName);

        let filename = Config.url_to_filename(article.url, day, websiteId) + "_thumbnail";
        return `${Config.LOCAL_FILE_BASE_URL}/${this.websiteName}/_thumbnails/${year}/${month}/${filename}`;
    }
}