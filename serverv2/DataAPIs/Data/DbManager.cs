// using System;
// using System.Linq;
// using System.Collections.Generic;

// using Microsoft.Data.SqlClient;

// // delete this...
// using Newtonsoft.Json;

// using VideoGameArchive.Entities;
// using VideoGameArchive.Core;


// namespace VideoGameArchive.Data
// {
//     public class DbManager_OLD
//     {
//         public static string LastSqlQuery;
//         private string connectionString;

//         public DbManager_OLD()
//         {
//             var builder = new SqlConnectionStringBuilder();

//             builder.DataSource = Secrets.SqlServerName;
//             builder.UserID = Secrets.SqlServerAdminUser;
//             builder.Password = Secrets.SqlServerAdminPasword;
//             builder.InitialCatalog = Secrets.SqlDbName;

//             connectionString = builder.ConnectionString;
//         }


//         /* =========================================================== */
//         /* ====   Get Methods   ====================================== */
//         /* =========================================================== */

//         public List<Article> GetArticlesForDate(string date)
//         {
//             string sql = SQLScripts.GetArticlesForDate(date.ToString());
//             return GetQuery<Article>(sql, (reader) => {
//                 // parse articles from response
//                 var article = new Article();
//                 article.title = reader.GetString(0);
//                 article.subtitle = reader.GetString(1);
//                 article.datePublished = reader.GetInt32(2);
//                 article.thumbnail = reader.IsDBNull(3) ? null : reader.GetString(3);
//                 article.website = reader.GetString(4);
//                 article.url = reader.GetString(5);
//                 article.articleType = reader.GetString(6);
//                 article.author = reader.GetString(7);
//                 return article;
//             });
//         }

//         public List<Article> GetArticlesBetweenDates(string start, string end)
//         {
//             string sql = SQLScripts.GetArticlesBetweenDates(start, end);
//             return GetQuery<Article>(sql, (reader) => {
//                 // parse articles from response
//                 var article = new Article();
//                 article.title = reader.GetString(0);
//                 article.subtitle = reader.GetString(1);
//                 article.datePublished = reader.GetInt32(2);
//                 article.thumbnail = reader.IsDBNull(3) ? null : reader.GetString(3);
//                 article.website = reader.GetString(4);
//                 article.url = reader.GetString(5);
//                 article.articleType = reader.GetString(6);
//                 article.author = reader.GetString(7);
//                 return article;
//             });
//         }


//         public List<int> GetDatesWithArticles(string startDate, string endDate)
//         {
//             string sql = SQLScripts.GetDatesWithArticles(startDate, endDate);
//             return GetQuery<int>(sql, (reader) => {
//                 return reader.GetInt32(0);
//             });
//         }


//         public List<Article> GetArticlesNotInDb(List<Article> articles)
//         {
//             // build article lookup
//             var articleLookup = new Dictionary<string, Article>();
//             foreach(var article in articles) {
//                 articleLookup[article.url] = article;
//             }

//             string sql = SQLScripts.GetUrlsOnRecordFromList(articles);
//             var urlsInDb = GetQuery<string>(sql, (reader) => {
//                 return reader.GetString(0);
//             });

//             foreach(var url in urlsInDb) {
//                 articleLookup.Remove(url);
//             }

//             var result = new List<Article>();
//             foreach(var entry in articleLookup) {
//                 result.Add(entry.Value);
//             }

//             return result;
//         }


//         public List<string> GetAuthorsNotInDb(List<Article> articles)
//         {
//             // build author lookup
//             var authorLookup = new HashSet<string>();
//             foreach(var article in articles) {
//                 authorLookup.Add(article.author);
//             }

//             string sql = SQLScripts.GetWritersOnRecordFromList(articles);
//             var authorsInDb = GetQuery<string>(sql, (reader) => {
//                 return reader.GetString(0);
//             });

//             foreach(var author in authorsInDb) {
//                 authorLookup.Remove(author);
//             }

//             var result = new List<string>();
//             foreach(var entry in authorLookup) {
//                 result.Add(entry);
//             }

//             return result;
//         }


//         public List<string> GetArticleTypesNotInDb(List<Article> articles)
//         {
//             // build author lookup
//             var articleTypeLookup = new HashSet<string>();
//             foreach(var article in articles) {
//                 articleTypeLookup.Add(article.articleType);
//             }

//             string sql = SQLScripts.GetArticleTypesOnRecordFromList(articles);
//             var articleTypesInDb = GetQuery<string>(sql, (reader) => {
//                 return reader.GetString(0);
//             });

//             foreach(var articleType in articleTypesInDb) {
//                 articleTypeLookup.Remove(articleType);
//             }

//             var result = new List<string>();
//             foreach(var entry in articleTypeLookup) {
//                 result.Add(entry);
//             }

//             return result;
//         }


//         public List<string> GetThumbnailsNotInDb(List<Article> articles)
//         {
//             // build thumbnail lookup
//             var thumbnailsLookup = new HashSet<string>();
//             foreach(var article in articles) {
//                 if(!string.IsNullOrEmpty(article.thumbnail))
//                     thumbnailsLookup.Add(article.thumbnail);
//             }

//             // 
//             if(thumbnailsLookup.Count == 0) {
//                 return new List<string>();
//             }

//             string sql = SQLScripts.GetThumbnailsOnRecordFromList(articles);
//             var thumbnails = GetQuery<string>(sql, (reader) => {
//                 return reader.GetString(0);
//             });

//             foreach(var thumbnail in thumbnails) {
//                 thumbnailsLookup.Remove(thumbnail);
//             }

//             var result = new List<string>();
//             foreach(var entry in thumbnailsLookup) {
//                 result.Add(entry);
//             }

//             return result;
//         }


//         public Dictionary<string, int> GetWebsiteIds()
//         {
//             string sql = SQLScripts.GetWebsiteIds();
//             var websites = GetQuery<Website>(sql, (reader) => {
//                 // parse websites from response
//                 var website = new Website();
//                 website.id = reader.GetInt32(0);
//                 website.name = reader.GetString(1);
//                 return website;
//             });

//             var result = new Dictionary<string, int>();
//             foreach(var website in websites) {
//                 result[website.name] = website.id;
//             }
//             return result;
//         }


//         public Dictionary<string, int> GetUrlIds(List<Article> articles)
//         {
//             string sql = SQLScripts.GetUrlIds(articles);
//             var urls = GetQuery<ArticleUrl>(sql, (reader) => {
//                 var url = new ArticleUrl();
//                 url.id = reader.GetInt32(0);
//                 url.url = reader.GetString(1);
//                 return url;
//             });

//             var result = new Dictionary<string, int>();
//             foreach(var url in urls) {
//                 result[url.url] = url.id;
//             }
//             return result;
//         }


//         public Dictionary<string, int> GetAuthorIds(List<Article> articles)
//         {
//             string sql = SQLScripts.GetAuthorIds(articles);
//             var authors = GetQuery<Author>(sql, (reader) => {
//                 var author = new Author();
//                 author.id = reader.GetInt32(0);
//                 author.name = reader.GetString(1);
//                 return author;
//             });

//             var result = new Dictionary<string, int>();
//             foreach(var author in authors) {
//                 result[author.name] = author.id;
//             }
//             return result;
//         }


//         public Dictionary<string, int> GetArticleIds(List<Article> articles)
//         {
//             string sql = SQLScripts.GetArticleIds(articles);
//             var articlesWithIds = GetQuery<Article>(sql, (reader) => {
//                 var article = new Article();
//                 article.id = reader.GetInt32(0);
//                 article.url = reader.GetString(1);
//                 return article;
//             });

//             var result = new Dictionary<string, int>();
//             foreach(var articlesWithId in articlesWithIds) {
//                 result[articlesWithId.url] = articlesWithId.id.Value;
//             }
//             return result;
//         }


//         public Dictionary<string, int> GetArticleTypeIds(List<Article> articles)
//         {
//             string sql = SQLScripts.GetArticleTypeIds(articles);
//             var articleTypes = GetQuery<ArticleType>(sql, (reader) => {
//                 var articleType = new ArticleType();
//                 articleType.id = reader.GetInt32(0);
//                 articleType.name = reader.GetString(1);
//                 return articleType;
//             });

//             var result = new Dictionary<string, int>();
//             foreach(var articleType in articleTypes) {
//                 result[articleType.name] = articleType.id;
//             }
//             return result;
//         }


//         public List<Article> GetArticlesForIds(List<int> articleIds)
//         {
//             string sql = SQLScripts.GetArticlesForIds(articleIds);
//             var articles = GetQuery<Article>(sql, (reader) => {
//                 var article = new Article();
//                 article.title = reader.GetString(0);
//                 article.subtitle = reader.GetString(1);
//                 article.author = reader.GetString(2);
//                 article.website = reader.GetString(3);
//                 article.url = reader.GetString(4);
//                 article.thumbnail = reader.IsDBNull(5) ? null : reader.GetString(5);
//                 article.datePublished = reader.GetInt32(6);
//                 return article;
//             });
//             return articles;
//         }





//         /* =========================================================== */
//         /* ====   Insert Methods   =================================== */
//         /* =========================================================== */

//         public void InsertAuthors(List<string> authors)
//         {
//             if(authors.Count == 0)
//                 return;

//             string sql = SQLScripts.InsertAuthors(authors);
//             RunQuery(sql);
//         }

//         public void InsertArticleTypes(List<string> articleTypes)
//         {
//             if(articleTypes.Count == 0)
//                 return;

//             string sql = SQLScripts.InsertArticleTypes(articleTypes);
//             RunQuery(sql);
//         }

//         public void InsertUrls(List<Article> articles)
//         {
//             if(articles.Count == 0)
//                 return;

//             string sql = SQLScripts.InsertUrls(articles);
//             RunQuery(sql);
//         }

//         public void InsertArticles(List<Article> articles)
//         {
//             if(articles.Count == 0)
//                 return;

//             // get id lookups
//             var websiteIds     = GetWebsiteIds();
//             var urlIds         = GetUrlIds(articles);
//             var authorIds      = GetAuthorIds(articles);
//             var articleTypeIds = GetArticleTypeIds(articles);

//             // insert articles
//             var sql = SQLScripts.InsertArticles(articles, websiteIds, urlIds, authorIds, articleTypeIds);
//             RunQuery(sql);
//         }

//         public void InsertThumbnails(List<string> thumbnailsToInsert, List<Article> articles)
//         {
//             Console.WriteLine("inserting thumbnails...");
//             // bail if nothing to insert
//             if(thumbnailsToInsert.Count == 0)
//                 return;

            
//             Console.WriteLine("building thumbnail lookup...");
//             // make a hashset for thumbnail lookups
//             var thumbnailsToInsertLookup = new HashSet<string>(thumbnailsToInsert);

//             // get full article data for each of the thumbnails we want to insert
//             Console.WriteLine("getting articles with target thumbnails...");
//             var articlesWithTargetThumbnails = articles.Where(a =>
//                  !string.IsNullOrEmpty(a.thumbnail) && 
//                 thumbnailsToInsertLookup.Contains(a.thumbnail)
//             ).ToList();

//             // get article id lookups
//             Console.WriteLine("getting article ids for thumbnail insertion...");
//             var articleIds = GetArticleIds(articlesWithTargetThumbnails);

//             // run query
//             Console.WriteLine("inesrting thumbnails...");
//             Console.WriteLine(JsonConvert.SerializeObject(articleIds));
//             string sql = SQLScripts.InsertThumbnails(articlesWithTargetThumbnails, articleIds);
//             RunQuery(sql);
//         }





//         /* =========================================================== */
//         /* ====   Main Methods   ===================================== */
//         /* =========================================================== */


//         private List<T> GetQuery<T>(string query, Func<SqlDataReader, T> parseRow)
//         {
//             DbManager_OLD.LastSqlQuery = query;

//             var results = new List<T>();
//             using (SqlConnection connection = new SqlConnection(connectionString))
//             {                
//                 connection.Open();
//                 using (SqlCommand command = new SqlCommand(query, connection))
//                 {
//                     using (SqlDataReader reader = command.ExecuteReader())
//                     {
//                         while (reader.Read())
//                         {
//                             // add each row to results
//                             results.Add(parseRow(reader));
//                         }
//                     }
//                 }
//             }
//             return results;
//         }


//         private void RunQuery(string query)
//         {
//             DbManager_OLD.LastSqlQuery = query;
//             using (SqlConnection connection = new SqlConnection(connectionString))
//             {                
//                 connection.Open();
//                 using (SqlCommand command = new SqlCommand(query, connection))
//                 {
//                     command.ExecuteReader();
//                 }
//             }
//         }
//     }


    
// }