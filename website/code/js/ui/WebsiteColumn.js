var WebsiteColumn = /** @class */ (function () {
    function WebsiteColumn(websiteName, articles, paddingLeft) {
        this.websiteName = websiteName;
        this.articles = articles;
        this.paddingLeft = paddingLeft;
    }
    WebsiteColumn.prototype.toHtml = function () {
        var containerDiv = this.getWebsiteColumn();
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
        // create thumbnail, if it exists
        var thumbnail = null;
        if (article.thumbnail !== null) {
            thumbnail = document.createElement('img');
            thumbnail.classList.add('article-thumbnail');
            thumbnail.src = this.getThumbnailUrl(article);
        }
        // create title
        var title = document.createElement('a');
        title.href = article.url;
        title.classList.add('article-title');
        title.innerText = article.title;
        if (thumbnail === null)
            title.style.width = '100%';
        // create subtitle
        var subtitle = document.createElement('div');
        subtitle.classList.add('article-subtitle');
        subtitle.innerText = article.subtitle;
        if (thumbnail === null)
            subtitle.style.width = '100%';
        // create author
        var author = document.createElement('div');
        author.classList.add('article-author');
        author.innerText = article.author;
        if (thumbnail === null)
            author.style.width = '100%';
        // and add everything to the container
        if (thumbnail !== null) { // don't add thumbnail if there i snone
            containerDiv.appendChild(thumbnail);
        }
        containerDiv.appendChild(title);
        if (article.subtitle !== '') { // don't add subtitle div if there is none
            containerDiv.appendChild(subtitle);
        }
        else { // and if there isn't a subtitle, add a new line (for the author)
            containerDiv.appendChild(document.createElement("br"));
        }
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
        websiteColumn.appendChild(label);
        websiteColumn.appendChild(document.createElement('hr'));
        return websiteColumn;
    };
    WebsiteColumn.prototype.getThumbnailUrl = function (article) {
        var month = Utils.getTwoCharNum(article.date.month);
        return "".concat(Config.LOCAL_FILE_BASE_URL, "/").concat(this.websiteName, "/_thumbnails/").concat(article.date.year.toString(), "/").concat(month, "/").concat(article.thumbnail);
    };
    // class declarations
    WebsiteColumn.ARTICLES_DIV_ID = 'articles';
    WebsiteColumn.WEBSITE_COLUMN_CLASS = 'news-site-column';
    WebsiteColumn.WEBSITE_COLUMN_HEADER_CLASS = 'news-site-column-header';
    return WebsiteColumn;
}());
