var SearchResult = /** @class */ (function () {
    function SearchResult(article) {
        this.article = article;
    }
    SearchResult.prototype.toHtml = function () {
        // create container
        var containerDiv = document.createElement("div");
        containerDiv.classList.add('article');
        containerDiv.appendChild(this.getDateWebsiteInfo());
        containerDiv.appendChild(this.getMainInfo());
        return containerDiv;
    };
    SearchResult.prototype.getDateWebsiteInfo = function () {
        // create container
        var containerDiv = document.createElement('div');
        containerDiv.classList.add('article-date-website-panel');
        // website label
        var websiteLabel = document.createElement('div');
        websiteLabel.innerText = this.article.website;
        // date
        var dateLabel = document.createElement('div');
        dateLabel.innerText = this.article.date.toPrettyString_FullDate();
        dateLabel.classList.add('article-date-website-panel-date');
        // add it all and return
        containerDiv.appendChild(dateLabel);
        containerDiv.appendChild(websiteLabel);
        return containerDiv;
    };
    SearchResult.prototype.getMainInfo = function () {
        // create container
        var containerDiv = document.createElement("div");
        containerDiv.classList.add('article-main-info');
        // create thumbnail, if it exists
        var thumbnail = null;
        if (this.article.thumbnail !== null) {
            thumbnail = document.createElement("img");
            thumbnail.classList.add('article-thumbnail');
            var month = Utils.getTwoCharNum(this.article.date.month);
            thumbnail.src = "".concat(Config.LOCAL_FILE_BASE_URL, "/").concat(this.article.website, "/_thumbnails/").concat(this.article.date.year, "/").concat(month, "/").concat(this.article.thumbnail);
        }
        // create title
        var title = document.createElement('a');
        title.href = this.article.url;
        title.classList.add('article-title');
        title.innerText = this.article.title;
        if (thumbnail === null)
            title.style.width = '100%';
        // create subtitle
        var subtitle = document.createElement('div');
        subtitle.classList.add('article-subtitle');
        subtitle.innerText = this.article.subtitle;
        if (thumbnail === null)
            subtitle.style.width = '100%';
        // create author
        var author = document.createElement('div');
        author.classList.add('article-author');
        author.innerText = this.article.author;
        if (thumbnail === null)
            author.style.width = '100%';
        // and add everything to the container
        if (thumbnail !== null) { // don't add thumbnail if there is none
            containerDiv.appendChild(thumbnail);
        }
        containerDiv.appendChild(title);
        if (this.article.subtitle !== '') { // don't add subtitle div if there is none
            containerDiv.appendChild(subtitle);
        }
        else { // and if there isn't a subtitle, add a new line (for the author)
            containerDiv.appendChild(document.createElement("br"));
        }
        containerDiv.appendChild(author);
        // and return 
        return containerDiv;
    };
    SearchResult.prototype.getThumbnailUrl = function () {
        var day = Utils.getTwoCharNum(this.article.date.day);
        var month = Utils.getTwoCharNum(this.article.date.month);
        var year = Utils.getTwoCharNum(this.article.date.year);
        var websiteId = Config.websiteNameToId(this.article.website);
        var filename = Config.url_to_filename(this.article.url, day, websiteId) + "_thumbnail";
        return "".concat(Config.LOCAL_FILE_BASE_URL, "/").concat(this.article.website, "/_thumbnails/").concat(year, "/").concat(month, "/").concat(filename);
    };
    // class declarations
    SearchResult.CONTAINER_DIV_ID = 'container';
    return SearchResult;
}());
