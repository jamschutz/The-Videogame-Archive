class SearchResult {
    public article: Article;

    constructor(article: Article) {
        this.article = article;
    }

    // class declarations
    static CONTAINER_DIV_ID = 'container';


    public toHtml() {
        // create container
        let containerDiv = document.createElement("div");
        containerDiv.classList.add('article');
        containerDiv.style.width = '350px';

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