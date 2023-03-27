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
            string test_url = "https://www.gamespot.com/review/destiny-the-taken-king/?slug=destiny-the-taken-king-review-in-progress&typeId=1100&id=6430557";
            Console.WriteLine($"original: {test_url}");
            Console.WriteLine($"filename: {Config.UrlToFilename(test_url, 30, 1)}");
        }
    }
}
