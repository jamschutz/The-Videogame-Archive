using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;

using WebsiteBuilder.Entities;
using WebsiteBuilder.UI;

namespace WebsiteBuilder
{
    class Program
    {
        static void Main(string[] args)
        {
            int year = 2003;
            int month = 10;
            int day = 13;

            DbManager dbManager = new DbManager();

            HtmlHead htmlHead = new HtmlHead();
            Calendar calendar = new Calendar(dbManager);

            Console.WriteLine("fetching articles...");
            var articles = dbManager.GetArticlesPublishedOnDate(20031013);
            Console.WriteLine("building publication columns...");
            var publicationColumns = GetPublicationColumns(articles);

            StringBuilder publicationColumnsHtml = new StringBuilder(800 * articles.Length + 800 * publicationColumns.Count);
            foreach (var publicationColumn in publicationColumns) {
                publicationColumnsHtml.AppendLine(publicationColumn.ToHtml());
            }

            Console.WriteLine("generating html...");
            string html = $@"

<!DOCTYPE html>
<meta charset=""utf-8"">
<meta name=""viewport"" content=""width=device-width,height=device-height,initial-scale=1.0"" />

{htmlHead.ToHtml()}

<html>

<body>
    <div>
        <div id=""calendar-month"">
        </div>
    
        <div class=""container"">
            <div class=""date-header"">
                <button onclick=""goToPreviousDay()"" >&lt;</button>
                <span id=""date-display"">{Utils.Utils.GetMonthName(month)} {day}, {year}</span>
                <button onclick=""goToNextDay()"" >&gt;</button>
                <input id=""search-bar"" type=""search"" placeholder=""Search..."" >
            </div>

            <div id=""articles"" class=""article-container"">
                {publicationColumnsHtml.ToString()}
            </div>
        </div>
    </div>
</body>

</html>
            ";


            Console.WriteLine("writing to file...");
            // make sure folder exists
            Directory.CreateDirectory($"{Config.StaticWebsiteFolder}/{year}/{month}");
            // and write to file
            File.WriteAllText($"{Config.StaticWebsiteFolder}/{year}/{month}/{day}.html", html);
        }


        private static List<PublicationColumn> GetPublicationColumns(Article[] articles)
        {
            Dictionary<string, List<Article>> publicationArticles = new Dictionary<string, List<Article>>();
            foreach (var article in articles) {
                if (!publicationArticles.ContainsKey(article.website)) {
                    publicationArticles[article.website] = new List<Article>();
                }

                publicationArticles[article.website].Add(article);
            }

            List<PublicationColumn> publicationColumns = new List<PublicationColumn>();
            foreach (var publication in publicationArticles.Keys) {
                publicationColumns.Add(new PublicationColumn(publication, publicationArticles[publication].ToArray()));
            }
            return publicationColumns;
        }
    }
}
