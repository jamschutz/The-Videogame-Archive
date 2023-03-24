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

        // create thumbnail, if it exists
        let thumbnail = null;
        if(article.thumbnail !== null) {
            thumbnail = document.createElement('img');
            thumbnail.classList.add('article-thumbnail');
            thumbnail.src = this.getThumbnailUrl(article);
        }

        // create title
        let title = document.createElement('a');
        title.href = article.url;
        title.classList.add('article-title');
        title.innerText = article.title;
        if(thumbnail === null) title.style.width = '100%';

        // create subtitle
        let subtitle = document.createElement('div');
        subtitle.classList.add('article-subtitle');
        subtitle.innerText = article.subtitle;
        if(thumbnail === null) subtitle.style.width = '100%';

        // create author
        let author = document.createElement('div');
        author.classList.add('article-author');
        author.innerText = article.author;
        if(thumbnail === null) author.style.width = '100%';

        // and add everything to the container
        if(thumbnail !== null) { // don't add thumbnail if there i snone
            containerDiv.appendChild(thumbnail);
        }
        containerDiv.appendChild(title);
        if(article.subtitle !== '') { // don't add subtitle div if there is none
            containerDiv.appendChild(subtitle);
        }
        else { // and if there isn't a subtitle, add a new line (for the author)
            containerDiv.appendChild(document.createElement("br"));
        }
        if(article.author !== null) {
            containerDiv.appendChild(author);
        }        

        // and return 
        return containerDiv;
    }


    private getWebsiteColumn() {
        let websiteColumn = document.createElement('div');
        websiteColumn.classList.add(WebsiteColumn.WEBSITE_COLUMN_CLASS);

        let label = document.createElement('span');
        label.classList.add(WebsiteColumn.WEBSITE_COLUMN_HEADER_CLASS);
        label.innerHTML = this.websiteName;

        websiteColumn.appendChild(label);
        websiteColumn.appendChild(document.createElement('hr'));
        
        return websiteColumn;
    }


    private getThumbnailUrl(article: Article) {
        let month = Utils.getTwoCharNum(article.date.month);
        return `${Config.LOCAL_FILE_BASE_URL}/${this.websiteName}/_thumbnails/${article.date.year.toString()}/${month}/${article.thumbnail}`;
    }
}