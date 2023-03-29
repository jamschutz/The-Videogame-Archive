using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using WebsiteBuilder.Entities;
using WebsiteBuilder.UI;

namespace WebsiteBuilder
{
    class Program
    {
        static void Main(string[] args)
        {
            //string test_url = "https://www.gamespot.com/review/destiny-the-taken-king/?slug=destiny-the-taken-king-review-in-progress&typeId=1100&id=6430557";
            //Console.WriteLine($"original: {test_url}");
            //Console.WriteLine($"filename: {Config.UrlToFilename(test_url, 30, 1)}");

            DbManager dbManager = new DbManager();
            var articles = dbManager.GetArticlesPublishedOnDate(20031013);
            var publicationColumns = GetPublicationColumns(articles);

            Console.WriteLine(publicationColumns[1].ToHtml());

            //Console.WriteLine($"got {articles.Length} articles");
            //foreach (var article in articles) {
            //    Console.WriteLine("\n---------------------------------------\n");
            //    Console.WriteLine(article.ToHtml("\t"));
            //    Console.WriteLine($"length: {article.ToHtml().Length}");
            //}

            int x = 0;
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
