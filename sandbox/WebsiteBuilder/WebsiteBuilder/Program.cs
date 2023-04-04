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
            int startYear = 1996;
            int endYear = 2000;

            DbManager dbManager = new DbManager();
            List<string> publications = dbManager.GetAllPublicationNames();
            
            for (int year = startYear; year <= endYear; year++) {
                BuildWebpageForYear(year, dbManager, publications);
            }            
        }


        private static void BuildWebpageForYear(int year, DbManager dbManager, List<string> publications)
        {
            // for each month...
            for (int month = 1; month <= 12; month++) {
                // and each day in month...
                for (int day = 1; day <= Utils.Utils.GetDaysInMonth(month, year); day++) {
                    // build webpage
                    Console.WriteLine($"building webpage for {month}/{day}/{year}...");
                    BuildWebpageForDate(year, month, day, dbManager, publications);
                }
            }
        }


        private static void BuildWebpageForDate(int year, int month, int day, DbManager dbManager, List<string> publications)
        {
            HtmlHead htmlHead = new HtmlHead();
            Calendar calendar = new Calendar(dbManager);

            int dateInt = year * 10000 + month * 100 + day;
            var articles = dbManager.GetArticlesPublishedOnDate(dateInt);
            var publicationColumns = GetPublicationColumns(articles, publications);

            StringBuilder publicationColumnsHtml = new StringBuilder(800 * articles.Length + 800 * publicationColumns.Count);
            foreach (var publicationColumn in publicationColumns)
            {
                publicationColumnsHtml.AppendLine(publicationColumn.ToHtml());
            }
            
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
            Directory.CreateDirectory($"{Config.StaticWebsiteFolder}/{year}/{Utils.Utils.GetTwoCharInt(month)}");
            // and write to file
            File.WriteAllText($"{Config.StaticWebsiteFolder}/{year}/{Utils.Utils.GetTwoCharInt(month)}/{Utils.Utils.GetTwoCharInt(day)}.html", html);
        }


        private static List<PublicationColumn> GetPublicationColumns(Article[] articles, List<string> publications)
        {
            Dictionary<string, List<Article>> publicationArticles = new Dictionary<string, List<Article>>();
            foreach (var publication in publications) {
                publicationArticles[publication] = new List<Article>();
            }

            foreach (var article in articles) {
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
