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

        // create thumbnail
        let thumbnail = document.createElement("img");
        thumbnail.classList.add('article-thumbnail');
        thumbnail.src = this.getThumbnailUrl(article);

        // create title
        let title = document.createElement('a');
        title.href = article.url;
        title.classList.add('article-title');
        title.innerText = article.title;

        // create subtitle
        let subtitle = document.createElement('span');
        subtitle.classList.add('article-subtitle');
        subtitle.innerText = article.subtitle;

        // create author
        let author = document.createElement('span');
        author.classList.add('article-author');
        author.innerText = article.author;
        
        // create new line
        let newLine = document.createElement('br');

        // and add everything to the container
        containerDiv.appendChild(thumbnail);
        containerDiv.appendChild(newLine);
        containerDiv.appendChild(title);
        containerDiv.appendChild(newLine);
        containerDiv.appendChild(subtitle);
        containerDiv.appendChild(newLine);
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

        let newLine1 = document.createElement("br");
        let newLine2 = document.createElement("br");

        websiteColumn.appendChild(label);
        websiteColumn.appendChild(newLine1);
        websiteColumn.appendChild(newLine2);
        
        return websiteColumn;
    }


    private getThumbnailUrl(article: Article) {
        let publishDay = article.date.split("/")[1];
        return Config.url_to_filename(article.url, publishDay) + "_thumbnail.jpg";
    }
}