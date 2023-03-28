using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebsiteBuilder
{
    static class Config
    {
        public static string DatabaseFile = "/_database/VideogamesDatabase.db";
        public static string ArchiveFolder = "/_website_backups";
        public static string StaticWebsiteFolder = "/StaticWebsite/html";
        public static string FileHostBaseUrl = "http://localhost:5000";


        public static string GetWebsiteName(int id)
        {
            switch (id) {
                case 1: return "GameSpot";
                case 2: return "Eurogamer";
                case 3: return "Gameplanet";
                case 4: return "JayIsGames";
                case 5: return "TIGSource";
                case 6: return "Indygamer";
                case 99: return "N64.com";
                default:
                    System.Console.WriteLine($"unknown website with id {id}, returning null");
                    return null;
            }
        }


        public static int GetWebsiteId(string name)
        {
            if (name == "GameSpot") return 1;
            if (name == "Eurogamer") return 2;
            if (name == "Gameplanet") return 3;
            if (name == "JayIsGames") return 4;
            if (name == "TIGSource") return 5;
            if (name == "Indygamer") return 6;
            if (name == "N64.com") return 99;

            System.Console.WriteLine($"unknown website called {name}, returning -1");
            return -1;
        }


        public static string UrlToFilename(string url, int day, int websiteId)
        {
            string[] relevant_url_parts;
            if (websiteId == 1)
            {
                // convert https://example.com/something/TAKE_THIS_PART
                relevant_url_parts = url.Split('/').Skip(4).ToArray();
            }
            else {
                // convert https://www.eurogamer.net/TAKE_THIS_PART
                relevant_url_parts = url.Split('/').Skip(3).ToArray();
            }
            // and join with underscores
            string filename_suffix = string.Join("_", relevant_url_parts);

            // if it has url parameters, remove them
            if (filename_suffix.Contains("?")) {
                filename_suffix = filename_suffix.Substring(0, filename_suffix.IndexOf("?"));
            }

            // if it has #some_tag at the end of it, remove them
            if (filename_suffix.Contains("#"))
            {
                filename_suffix = filename_suffix.Substring(0, filename_suffix.IndexOf("#"));
            }

            // if it ends in an underscore, remove it
            if (filename_suffix.EndsWith("_")) {
                filename_suffix = filename_suffix.Substring(0, filename_suffix.Length - 1);
            }

            return $"{day}_{filename_suffix}";
        }
    }
}
