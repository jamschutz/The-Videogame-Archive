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


        public string ToHtml(string indentation="")
        {
            string extraIndentation = $"{indentation}\t";
            StringBuilder html = new StringBuilder(800);

            // create div
            html.AppendLine($"{indentation}<div class=\"article\">");

            // add thumbnail if we have it
            if (thumbnail != null)
            {
                string dateString = datePublished.ToString();
                string year = dateString.Substring(0, 4);
                string month = dateString.Substring(4, 2);
                html.Append($"{extraIndentation}<img class=\"article-thumbnail\" src =\"{Config.FileHostBaseUrl}/{website}/_thumbnails/{year}/{month}/{thumbnail}\">\n");
            }

            // add title
            html.Append($"{extraIndentation}<a href=\"{url}\" class=\"article-title\">{title}</a>\n");

            // add subtitle if we have it
            if (subtitle != null && subtitle != "") {
                html.Append($"{extraIndentation}<div class=\"article-subtitle\">{subtitle}</div>\n");
            }

            // add author if we have it
            if (author != null && author != "") {
                html.Append($"{extraIndentation}<div class=\"article-author\">{author}</div>\n");
            }

            // close article div
            html.Append($"{indentation}</div>");
            return html.ToString();
        }
    }
}
