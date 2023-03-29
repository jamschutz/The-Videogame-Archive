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
            // create article div
            StringBuilder html = new StringBuilder("<div class=\"article\">\n", 800);

            // add thumbnail if we have it
            if (thumbnail != null)
            {
                string dateString = datePublished.ToString();
                string year = dateString.Substring(0, 4);
                string month = dateString.Substring(4, 2);
                html.Append($"<img class=\"article-thumbnail\" src =\"{Config.FileHostBaseUrl}/{website}/_thumbnails/{year}/{month}/{thumbnail}\">");
            }

            // add title
            html.Append($"<a href=\"{url}\" class=\"article-title\">{title}</a>");

            // add subtitle if we have it
            if (subtitle != null && subtitle != "") {
                html.Append($"<div class=\"article-subtitle\">{subtitle}</div>");
            }

            // add author if we have it
            if (author != null && author != "") {
                html.Append($"<div class=\"article-author\">{author}</div>");
            }

            // close article div
            html.Append("</div>");
            return html.ToString();
        }
    }
}
