using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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

            Console.WriteLine($"got {articles.Length} articles");
            foreach (var article in articles) {
                Console.WriteLine("\n---------------------------------------\n");
                Console.WriteLine(article.ToString());
            }

            int x = 0;
        }
    }
}
