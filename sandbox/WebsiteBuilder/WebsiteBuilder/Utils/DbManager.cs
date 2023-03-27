using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using System.Data.SQLite;

using WebsiteBuilder.Entities;

namespace WebsiteBuilder
{
    class DbManager
    {
        public DbManager()
        {
            // do nothing
        }


        public Article[] GetArticlesPublishedOnDate(int date)
        {
            List<Article> articles = new List<Article>();

            string query = $@"
                SELECT 
                    Article.Title, Article.DatePublished, Article.Url, Article.WebsiteId, Article.Subtitle, Writer.Name, Thumbnail.Filename
                FROM 
                    Article
                INNER JOIN
                    Writer ON Article.AuthorId = Writer.Id
                LEFT JOIN
                    Thumbnail ON Article.Id = Thumbnail.ArticleId
                WHERE
                    DatePublished = {date}
            ";
            using (var connection = new SQLiteConnection($"Data Source={Config.DatabaseFile}"))
            {
                connection.Open();

                var command = connection.CreateCommand();
                command.CommandText = query;

                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        // parse article info
                        var article = new Article();
                        article.title = reader.GetString(0);
                        article.datePublished = reader.GetInt32(1);
                        article.url = reader.GetString(2);
                        article.website = Config.GetWebsiteName(reader.GetInt32(3));
                        article.subtitle = reader.GetString(4);
                        article.author = reader.GetString(5);
                        article.thumbnail = reader.IsDBNull(6)? null : reader.GetString(6);

                        // add add to list
                        articles.Add(article);
                    }
                }
            }

            return articles.ToArray();
        }
        



        private void ExecuteQuery(string query)
        {
            using (var connection = new SQLiteConnection($"Data Source={Config.DatabaseFile}"))
            {
                connection.Open();

                var command = connection.CreateCommand();
                command.CommandText = query;

                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        var name = reader.GetString(0);

                        Console.WriteLine($"Article: {name}!");
                    }
                }
            }
        }
    }
}
