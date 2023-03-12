var WebsiteColumn = /** @class */ (function () {
    function WebsiteColumn(websiteName, articles, paddingLeft) {
        this.websiteName = websiteName;
        this.articles = articles;
        this.paddingLeft = paddingLeft;
    }
    WebsiteColumn.prototype.toHtml = function () {
        var containerDiv = this.getWebsiteColumn();
        containerDiv.style.marginLeft = "".concat(this.paddingLeft, "px");
        // if no articles for this day, just say so
        if (this.articles.length === 0) {
            var noArticles = document.createElement('p');
            noArticles.innerHTML = "No articles found for this date.";
            noArticles.classList.add('no-article-msg');
            containerDiv.appendChild(noArticles);
        }
        // otherwise, list articles
        else {
            for (var i = 0; i < this.articles.length; i++) {
                var article = this.articles[i];
                var articleDiv = this.getArticleDiv(article);
                containerDiv.appendChild(articleDiv);
            }
        }
        return containerDiv;
    };
    WebsiteColumn.prototype.getArticleDiv = function (article) {
        // create container
        var containerDiv = document.createElement("div");
        containerDiv.classList.add('article');
        // create thumbnail
        var thumbnail = document.createElement("img");
        thumbnail.classList.add('article-thumbnail');
        var thumbnailSrc = this.getThumbnailUrl(article);
        thumbnail.src = "".concat(thumbnailSrc, ".jpg");
        thumbnail.onerror = function () {
            this.onerror = null;
            this.src = "".concat(thumbnailSrc, ".png");
        };
        // create title
        var title = document.createElement('a');
        title.href = article.url;
        title.classList.add('article-title');
        title.innerText = article.title;
        // create subtitle
        var subtitle = document.createElement('span');
        subtitle.classList.add('article-subtitle');
        subtitle.innerText = article.subtitle;
        // create author
        var author = document.createElement('span');
        author.classList.add('article-author');
        author.innerText = article.author;
        // and add everything to the container
        containerDiv.appendChild(thumbnail);
        containerDiv.appendChild(document.createElement('br'));
        containerDiv.appendChild(title);
        containerDiv.appendChild(document.createElement('br'));
        containerDiv.appendChild(subtitle);
        containerDiv.appendChild(document.createElement('br'));
        containerDiv.appendChild(author);
        // and return 
        return containerDiv;
    };
    WebsiteColumn.prototype.getWebsiteColumn = function () {
        var websiteColumn = document.createElement('div');
        websiteColumn.classList.add(WebsiteColumn.WEBSITE_COLUMN_CLASS);
        var label = document.createElement('span');
        label.classList.add(WebsiteColumn.WEBSITE_COLUMN_HEADER_CLASS);
        label.innerHTML = this.websiteName;
        var newLine1 = document.createElement("br");
        var newLine2 = document.createElement("br");
        websiteColumn.appendChild(label);
        websiteColumn.appendChild(newLine1);
        websiteColumn.appendChild(newLine2);
        return websiteColumn;
    };
    WebsiteColumn.prototype.getThumbnailUrl = function (article) {
        var day = Utils.getTwoCharNum(article.date.split("/")[1]);
        var month = Utils.getTwoCharNum(article.date.split("/")[0]);
        var year = Utils.getTwoCharNum(article.date.split("/")[2]);
        var websiteId = Config.websiteNameToId(this.websiteName);
        var filename = Config.url_to_filename(article.url, day, websiteId) + "_thumbnail";
        return "".concat(Config.LOCAL_FILE_BASE_URL, "/").concat(this.websiteName, "/_thumbnails/").concat(year, "/").concat(month, "/").concat(filename);
    };
    // class declarations
    WebsiteColumn.ARTICLES_DIV_ID = 'articles';
    WebsiteColumn.WEBSITE_COLUMN_CLASS = 'news-site-column';
    WebsiteColumn.WEBSITE_COLUMN_HEADER_CLASS = 'news-site-column-header';
    return WebsiteColumn;
}());
