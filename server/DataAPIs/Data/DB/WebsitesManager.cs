using System;
using System.Linq;
using System.Collections.Generic;

using Npgsql;

using VideoGameArchive.Entities;
using VideoGameArchive.Core;


namespace VideoGameArchive.Data.DB
{
    public class WebsitesManager
    {
        private DbManager dbManager;
        private Func<NpgsqlDataReader, Website> parseWebsiteRow;

        public WebsitesManager()
        {
            dbManager = new DbManager();
            parseWebsiteRow = (reader) => {
                var website = new Website()
                {
                    id = reader.GetInt32(0),
                    name = reader.GetString(1),
                    founders = reader.IsDBNull(2) ? null : reader.GetString(2),
                    yearStarted = reader.GetInt32(3),
                    yearEnded = reader.IsDBNull(4) ? null : reader.GetInt32(4),
                    url = reader.GetString(5),
                    country = reader.GetString(6),
                    isActive = reader.GetBoolean(7),
                    type = reader.GetString(8),
                    lastWebcrawlDate = reader.IsDBNull(9) ? null : reader.GetInt32(9)
                };
                
                return website;
            };
        }


        /* =========================================================== */
        /* ====   GET Methods   ====================================== */
        /* =========================================================== */


        public List<Website> GetWebsites()
        {
            string sql =  $@"
                SELECT
                    ""Websites"".""Id"", ""Websites"".""Name"", ""Websites"".""Founders"", ""Websites"".""YearStarted"", ""Websites"".""YearEnded"", ""Websites"".""Url"", ""Websites"".""Country"", ""Websites"".""IsActive"", ""WebsiteTypes"".""Name"", ""Websites"".""LastWebcrawlDate""
                FROM
                    ""Websites""
                INNER JOIN
                    ""WebsiteTypes""
                ON
                    ""WebsiteTypes"".""Id"" = ""Websites"".""TypeId""
            ";

            return dbManager.GetQuery<Website>(sql, parseWebsiteRow);
        }
    }
}