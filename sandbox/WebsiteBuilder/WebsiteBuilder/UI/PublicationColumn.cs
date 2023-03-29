using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using WebsiteBuilder.Entities;

namespace WebsiteBuilder.UI
{
    class PublicationColumn
    {
        private string publicationName;
        private Article[] articles;

        public PublicationColumn(string publicationName, Article[] articles)
        {
            this.publicationName = publicationName;
            this.articles = articles;
        }


        public string ToHtml(string indentation="")
        {
            string extraIndentation = $"{indentation}\t";
            StringBuilder html = new StringBuilder(articles.Length * 800 + 800);

            // create publication column 
            html.AppendLine($"{indentation}<div class=\"publication-column\">");

            // add name label
            html.AppendLine($"{extraIndentation}<span class=\"publication-column-header\">{publicationName}</span>");
            // add underline
            html.AppendLine($"{extraIndentation}<hr>");

            // add articles
            if (articles.Length == 0) {
                html.AppendLine($"{extraIndentation}< p class=\"no-article-msg\">No articles found for this date.</p>");
            }
            else {
                string articleIndentation = $"{extraIndentation}\t";
                foreach (var article in articles) {
                    html.AppendLine(article.ToHtml(articleIndentation));
                }                
            }

            // close publication div
            html.AppendLine($"{indentation}</div>");
            return html.ToString();
        }
    }
}
