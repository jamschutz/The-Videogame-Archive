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

        public ArticlesManager()
        {
            dbManager = new DbManager();
        }


        /* =========================================================== */
        /* ====   GET Methods   ====================================== */
        /* =========================================================== */


        // public List<Article> GetArticlesForDate(string date)
        // {
        //     string sql = SQLScripts.GetArticlesForDate(date.ToString());
        //     return GetQuery<Article>(sql, (reader) => {
        //         // parse articles from response
        //         var article = new Article();
        //         article.title = reader.GetString(0);
        //         article.subtitle = reader.GetString(1);
        //         article.datePublished = reader.GetInt32(2);
        //         article.thumbnail = reader.IsDBNull(3) ? null : reader.GetString(3);
        //         article.website = reader.GetString(4);
        //         article.url = reader.GetString(5);
        //         article.articleType = reader.GetString(6);
        //         article.author = reader.GetString(7);
        //         return article;
        //     });
        // }

        // public List<Article> GetArticlesBetweenDates(string start, string end)
        // {
        //     string sql = SQLScripts.GetArticlesBetweenDates(start, end);
        //     return GetQuery<Article>(sql, (reader) => {
        //         // parse articles from response
        //         var article = new Article();
        //         article.title = reader.GetString(0);
        //         article.subtitle = reader.GetString(1);
        //         article.datePublished = reader.GetInt32(2);
        //         article.thumbnail = reader.IsDBNull(3) ? null : reader.GetString(3);
        //         article.website = reader.GetString(4);
        //         article.url = reader.GetString(5);
        //         article.articleType = reader.GetString(6);
        //         article.author = reader.GetString(7);
        //         return article;
        //     });
        // }


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

            var articles = dbManager.GetQuery<Article, int>(sql, parameters, (reader) => {
                var article = new Article();
                article.title = reader.GetString(0);
                article.subtitle = reader.GetString(1);
                article.author = reader.GetString(2);
                article.website = reader.GetString(3);
                article.url = reader.GetString(4);
                article.thumbnail = reader.IsDBNull(5) ? null : reader.GetString(5);
                article.datePublished = reader.GetInt32(6);
                return article;
            });
            return articles;
        }
    }
}