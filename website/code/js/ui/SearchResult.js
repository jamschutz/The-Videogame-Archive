var SearchResult = /** @class */ (function () {
    function SearchResult(article) {
        this.article = article;
    }
    SearchResult.prototype.toHtml = function () {
        // create container
        var containerDiv = document.createElement("div");
        containerDiv.classList.add('article');
        containerDiv.style.width = '350px';
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
        var day = Utils.getTwoCharNum(this.article.date.split("/")[1]);
        var month = Utils.getTwoCharNum(this.article.date.split("/")[0]);
        var year = Utils.getTwoCharNum(this.article.date.split("/")[2]);
        var websiteId = Config.websiteNameToId(this.article.website);
        var filename = Config.url_to_filename(this.article.url, day, websiteId) + "_thumbnail";
        return "".concat(Config.LOCAL_FILE_BASE_URL, "/").concat(this.article.website, "/_thumbnails/").concat(year, "/").concat(month, "/").concat(filename);
    };
    // class declarations
    SearchResult.CONTAINER_DIV_ID = 'container';
    return SearchResult;
}());
