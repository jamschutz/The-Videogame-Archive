using System.Collections.Generic;

using Microsoft.Data.SqlClient;

using VideoGameArchive.Entities;
using VideoGameArchive.Core;


namespace VideoGameArchive.Data
{
    public class DbManager
    {
        string connectionString;
        public DbManager()
        {
            var builder = new SqlConnectionStringBuilder();

            builder.DataSource = Secrets.SqlServerName;
            builder.UserID = Secrets.SqlServerAdminUser;
            builder.Password = Secrets.SqlServerAdminPasword;
            builder.InitialCatalog = Secrets.SqlDbName;

            connectionString = builder.ConnectionString;
        }


        public Article[] GetArticlesForDate(string date)
        {
            var articles = new List<Article>();
            using (SqlConnection connection = new SqlConnection(connectionString))
            {                
                connection.Open();

                string sql = SQLScripts.GetArticlesForDate(date.ToString());

                using (SqlCommand command = new SqlCommand(sql, connection))
                {
                    using (SqlDataReader reader = command.ExecuteReader())
                    {
                        while (reader.Read())
                        {
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

                            articles.Add(article);
                        }
                    }
                }                    
            }

            return articles.ToArray();
        }
    }


    
}