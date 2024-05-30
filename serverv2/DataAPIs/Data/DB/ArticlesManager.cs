using System;
using System.Linq;
using System.Collections.Generic;

using Npgsql;

using VideoGameArchive.Entities;
using VideoGameArchive.Core;


namespace VideoGameArchive.Data.DB
{
    public class ArticlesManager
    {
        private DbManager dbManager;
        private Func<NpgsqlDataReader, Article> parseArticleRow;

        public ArticlesManager()
        {
            dbManager = new DbManager();
            parseArticleRow = (reader) => {
                var article = new Article();
                article.title = reader.GetString(0);
                article.subtitle = reader.GetString(1);
                article.author = reader.GetString(2);
                article.website = reader.GetString(3);
                article.url = reader.GetString(4);
                article.thumbnail = reader.IsDBNull(5) ? null : reader.GetString(5);
                article.datePublished = reader.GetInt32(6);
                return article;
            };
        }


        /* =========================================================== */
        /* ====   GET Methods   ====================================== */
        /* =========================================================== */


        public List<Article> GetArticlesForDate(int date)
        {
            var parameters = new List<PostgresParameter<int>>() { 
                new PostgresParameter<int>() { name = "date", value = date }
            };

            string sql =  $@"
                SELECT
                    ""Articles"".""Title"", ""Articles"".""Subtitle"", ""Writers"".""Name"", ""Websites"".""Name"", ""Articles"".""Url"", ""Articles"".""Thumbnail"", ""Articles"".""DatePublished""
                FROM
                    ""Articles""
                INNER JOIN
                    ""Writers""
                ON
                    ""Articles"".""AuthorId"" = ""Writers"".""Id""
                INNER JOIN
                    ""Websites""
                ON
                    ""Articles"".""WebsiteId"" = ""Websites"".""Id""
                WHERE
                    ""Articles"".""DatePublished"" = @date
            ";

            return dbManager.GetQuery<Article, int>(sql, parameters, parseArticleRow);
        }

        public List<Article> GetArticlesBetweenDates(int start, int end)
        {
            var parameters = new List<PostgresParameter<int>>() { 
                new PostgresParameter<int>() { name = "start", value = start },
                new PostgresParameter<int>() { name = "end", value = end },
            };

            string sql =  $@"
                SELECT
                    ""Articles"".""Title"", ""Articles"".""Subtitle"", ""Writers"".""Name"", ""Websites"".""Name"", ""Articles"".""Url"", ""Articles"".""Thumbnail"", ""Articles"".""DatePublished""
                FROM
                    ""Articles""
                INNER JOIN
                    ""Writers""
                ON
                    ""Articles"".""AuthorId"" = ""Writers"".""Id""
                INNER JOIN
                    ""Websites""
                ON
                    ""Articles"".""WebsiteId"" = ""Websites"".""Id""
                WHERE
                    ""Articles"".""DatePublished"" >= @start AND ""Articles"".""DatePublished"" <= @end
            ";

            return dbManager.GetQuery<Article, int>(sql, parameters, parseArticleRow);
        }


        // public List<int> GetDatesWithArticles(string startDate, string endDate)
        // {
        //     string sql = SQLScripts.GetDatesWithArticles(startDate, endDate);
        //     return GetQuery<int>(sql, (reader) => {
        //         return reader.GetInt32(0);
        //     });
        // }


        public List<Article> GetArticlesWithIds(List<int> ids)
        {
            var parameters = new List<PostgresParameter<int>>();
            for(int i = 0; i < ids.Count; i++) {
                parameters.Add(new PostgresParameter<int>() {
                    name = $"id{i}",
                    value = ids[i]
                });
            }

            string parameterNames = string.Join(",", parameters.Select(p => $"@{p.name}").ToList());
            string sql =  $@"
                SELECT
                    ""Articles"".""Title"", ""Articles"".""Subtitle"", ""Writers"".""Name"", ""Websites"".""Name"", ""Articles"".""Url"", ""Articles"".""Thumbnail"", ""Articles"".""DatePublished""
                FROM
                    ""Articles""
                INNER JOIN
                    ""Writers""
                ON
                    ""Articles"".""AuthorId"" = ""Writers"".""Id""
                INNER JOIN
                    ""Websites""
                ON
                    ""Articles"".""WebsiteId"" = ""Websites"".""Id""
                WHERE
                    ""Articles"".""Id"" in ({parameterNames})
            ";

            var articles = dbManager.GetQuery<Article, int>(sql, parameters, parseArticleRow);
            return articles;
        }
    }
}