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
        // create thumbnail
        var thumbnail = document.createElement("img");
        thumbnail.classList.add('article-thumbnail');
        var thumbnailSrc = this.getThumbnailUrl();
        thumbnail.src = "".concat(thumbnailSrc, ".jpg");
        thumbnail.onerror = function () {
            var fileExtension = this.src.split(".")[this.src.split(".").length - 1];
            if (fileExtension === 'jpg') {
                this.src = "".concat(thumbnailSrc, ".png");
            }
            else {
                this.onerror = null;
                // for each sibling
                var element = this;
                while (element = element.nextSibling) {
                    if (element.nodeType === 3)
                        continue; // text node
                    // set width to 100%
                    element.style.width = '100%';
                }
                this.parentNode.removeChild(this);
            }
        };
        // create title
        var title = document.createElement('a');
        title.href = this.article.url;
        title.classList.add('article-title');
        title.innerText = this.article.title;
        // create subtitle
        var subtitle = document.createElement('div');
        subtitle.classList.add('article-subtitle');
        subtitle.innerText = this.article.subtitle;
        // create author
        var author = document.createElement('div');
        author.classList.add('article-author');
        author.innerText = this.article.author;
        // and add everything to the container
        containerDiv.appendChild(thumbnail);
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
