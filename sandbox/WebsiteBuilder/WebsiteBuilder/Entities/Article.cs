using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebsiteBuilder.Entities
{
    class Article
    {
        public string title;
        public string subtitle;
        public string author;
        public string url;
        public string website;
        public string thumbnail;
        public int datePublished;

        public string ToString()
        {
            return $"title: {title} \nsubtitle: {subtitle} \nauthor: {author} \nurl: {url} \nwebsite: {website} \nthumbnail: {thumbnail} \ndate: {datePublished}";
        }


        public string ToHtml()
        {
            string dateString = datePublished.ToString();
            string year = dateString.Substring(0, 4);
            string month = dateString.Substring(4, 2);
            string day = dateString.Substring(6, 2);

            return $@"
                <div class=""article"">
                    <img class=""article-thumbnail"" src =""{Config.FileHostBaseUrl}/{website}/_thumbnails/{year}/{month}/{thumbnail}"">
                    <a href=""{url}"" class=""article-title"">{title}</a>
                    <div class=""article-subtitle"">{subtitle}</div>
                    <div class=""article-author"">{author}</div>
                </div>
            ";
        }
    }
}
