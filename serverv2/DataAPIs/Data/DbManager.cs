using System;
using System.Linq;
using System.Collections.Generic;

using Microsoft.Data.SqlClient;

using VideoGameArchive.Entities;
using VideoGameArchive.Core;


namespace VideoGameArchive.Data
{
    public class DbManager
    {
        public static string LastSqlQuery;
        private string connectionString;

        public DbManager()
        {
            var builder = new SqlConnectionStringBuilder();

            builder.DataSource = Secrets.SqlServerName;
            builder.UserID = Secrets.SqlServerAdminUser;
            builder.Password = Secrets.SqlServerAdminPasword;
            builder.InitialCatalog = Secrets.SqlDbName;

            connectionString = builder.ConnectionString;
        }


        /* =========================================================== */
        /* ====   Get Methods   ====================================== */
        /* =========================================================== */

        public List<Article> GetArticlesForDate(string date)
        {
            string sql = SQLScripts.GetArticlesForDate(date.ToString());
            return GetQuery<Article>(sql, (reader) => {
                // parse articles from response
                var article = new Article();
                article.title = reader.GetString(0);
                article.subtitle = reader.GetString(1);
                article.datePublished = reader.GetInt32(2);
                article.thumbnail = reader.IsDBNull(6) ? null : reader.GetString(3);
                article.website = reader.GetString(4);
                article.url = reader.GetString(5);
                article.articleType = reader.GetString(6);
                article.author = reader.GetString(7);
                return article;
            });
        }


        public List<int> GetDatesWithArticles(string startDate, string endDate)
        {
            string sql = SQLScripts.GetDatesWithArticles(startDate, endDate);
            return GetQuery<int>(sql, (reader) => {
                return reader.GetInt32(0);
            });
        }


        public List<Article> GetArticlesNotInDb(List<Article> articles)
        {
            // build article lookup
            var articleLookup = new Dictionary<string, Article>();
            foreach(var article in articles) {
                articleLookup[article.url] = article;
            }

            string sql = SQLScripts.GetUrlsOnRecordFromList(articles);
            var urlsInDb = GetQuery<string>(sql, (reader) => {
                return reader.GetString(0);
            });

            foreach(var url in urlsInDb) {
                articleLookup.Remove(url);
            }

            var result = new List<Article>();
            foreach(var entry in articleLookup) {
                result.Add(entry.Value);
            }

            return result;
        }


        public List<string> GetAuthorsNotInDb(List<Article> articles)
        {
            // build author lookup
            var authorLookup = new HashSet<string>();
            foreach(var article in articles) {
                authorLookup.Add(article.author);
            }

            string sql = SQLScripts.GetWritersOnRecordFromList(articles);
            var authorsInDb = GetQuery<string>(sql, (reader) => {
                return reader.GetString(0);
            });

            foreach(var author in authorsInDb) {
                authorLookup.Remove(author);
            }

            var result = new List<string>();
            foreach(var entry in authorLookup) {
                result.Add(entry);
            }

            return result;
        }


        public List<string> GetArticleTypesNotInDb(List<Article> articles)
        {
            // build author lookup
            var articleTypeLookup = new HashSet<string>();
            foreach(var article in articles) {
                articleTypeLookup.Add(article.articleType);
            }

            string sql = SQLScripts.GetArticleTypesOnRecordFromList(articles);
            var articleTypesInDb = GetQuery<string>(sql, (reader) => {
                return reader.GetString(0);
            });

            foreach(var articleType in articleTypesInDb) {
                articleTypeLookup.Remove(articleType);
            }

            var result = new List<string>();
            foreach(var entry in articleTypeLookup) {
                result.Add(entry);
            }

            return result;
        }





        /* =========================================================== */
        /* ====   Insert Methods   =================================== */
        /* =========================================================== */

        public void InsertAuthors(List<string> authors)
        {
            if(authors.Count == 0)
                return;

            string sql = SQLScripts.InsertAuthors(authors);
            RunQuery(sql);
        }

        public void InsertArticleTypes(List<string> articleTypes)
        {
            if(articleTypes.Count == 0)
                return;

            string sql = SQLScripts.InsertArticleTypes(articleTypes);
            RunQuery(sql);
        }

        public void InsertUrls(List<Article> articles)
        {
            if(articles.Count == 0)
                return;

            string sql = SQLScripts.InsertUrls(articles);
            RunQuery(sql);
        }





        /* =========================================================== */
        /* ====   Main Methods   ===================================== */
        /* =========================================================== */


        private List<T> GetQuery<T>(string query, Func<SqlDataReader, T> parseRow)
        {
            DbManager.LastSqlQuery = query;

            var results = new List<T>();
            using (SqlConnection connection = new SqlConnection(connectionString))
            {                
                connection.Open();
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    using (SqlDataReader reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            // add each row to results
                            results.Add(parseRow(reader));
                        }
                    }
                }
            }
            return results;
        }


        private void RunQuery(string query)
        {
            DbManager.LastSqlQuery = query;
            using (SqlConnection connection = new SqlConnection(connectionString))
            {                
                connection.Open();
                using (SqlCommand command = new SqlCommand(query, connection))
                {
                    command.ExecuteReader();
                }
            }
        }
    }


    
}