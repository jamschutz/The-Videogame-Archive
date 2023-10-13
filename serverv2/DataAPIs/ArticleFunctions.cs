using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Generic;

using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

using Newtonsoft.Json;

using VideoGameArchive.Core;
using VideoGameArchive.Data;
using VideoGameArchive.Entities;
using VideoGameArchive.Responses;

namespace VideoGameArchive
{
    public static class ArticleFunctions
    {
        private static DbManager dbManager;


        [FunctionName("GetArticles")]
        public static HttpResponseMessage GetArticles(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("GetArticles processed a request.");

            // process parameters
            string rawDate = req.Query["date"];
            string websiteParam = req.Query["websiteId"];

            // convert to what we want
            var date = new CalendarDate(rawDate);
            var websiteId = string.IsNullOrEmpty(websiteParam)? -1 : int.Parse(websiteParam);

            // get articles from db
            InitDbManager();
            var articles = ArticleFunctions.dbManager.GetArticlesForDate(date.ToUrlString());

            // format and return
            var response = JsonConvert.SerializeObject(articles);
            return new HttpResponseMessage(HttpStatusCode.OK) {
                Content = new StringContent(response, Encoding.UTF8, "application/json")
            };
        }


        [FunctionName("GetArticlesForIds")]
        public static async Task<HttpResponseMessage> GetArticleIds(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("GetArticles processed a request.");

            // read requeust
            var reqBody = await new StreamReader(req.Body).ReadToEndAsync();
            var articleIds = JsonConvert.DeserializeObject<List<int>>(reqBody);

            // get articles from db
            InitDbManager();
            var articles = ArticleFunctions.dbManager.GetArticlesForIds(articleIds);

            // format and return
            var response = JsonConvert.SerializeObject(articles);
            return new HttpResponseMessage(HttpStatusCode.OK) {
                Content = new StringContent(response, Encoding.UTF8, "application/json")
            };
        }


        [FunctionName("DatesWithArticles")]
        public static HttpResponseMessage GetDatesWithArticles(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("DatesWithArticles processed a request.");

            // process parameters
            string start = req.Query["start"];
            string end = req.Query["end"];

            // ensure start and end are numbers
            try {
                int test = int.Parse(start);
                test = int.Parse(end);
            }
            catch {
                // throw error if they aren't, and return
                log.LogError($"DatesWithArticles got a bad start or end date: {start}, {end}");
                return new HttpResponseMessage(HttpStatusCode.BadRequest) {
                    Content = new StringContent("Bad request: start and end must be numbers", Encoding.UTF8, "application/json")
                };
            }

            // convert to what we want
            InitDbManager();
            var datesWithArticles = ArticleFunctions.dbManager.GetDatesWithArticles(start, end);

            // format and return
            var response = JsonConvert.SerializeObject(datesWithArticles);
            return new HttpResponseMessage(HttpStatusCode.OK) {
                Content = new StringContent(response, Encoding.UTF8, "application/json")
            };
        }


        [FunctionName("InsertArticles")]
        public static async Task<HttpResponseMessage> InsertArticles(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("InsertSearchResults processed a request.");

            var reqBody = await new StreamReader(req.Body).ReadToEndAsync();
            var articles = JsonConvert.DeserializeObject<List<Article>>(reqBody);

            InitDbManager();

            try {
                // get list of data we need to insert before the articles
                var articlesToInsert     = ArticleFunctions.dbManager.GetArticlesNotInDb(articles);
                var authorsToInsert      = ArticleFunctions.dbManager.GetAuthorsNotInDb(articles);
                var articleTypesToInsert = ArticleFunctions.dbManager.GetArticleTypesNotInDb(articles);
                var thumbnailsToInsert   = ArticleFunctions.dbManager.GetThumbnailsNotInDb(articles);

                // insert data articles depend on first
                ArticleFunctions.dbManager.InsertAuthors(authorsToInsert);
                ArticleFunctions.dbManager.InsertArticleTypes(articleTypesToInsert);
                ArticleFunctions.dbManager.InsertUrls(articlesToInsert);
                ArticleFunctions.dbManager.InsertArticles(articlesToInsert);
                ArticleFunctions.dbManager.InsertThumbnails(thumbnailsToInsert, articles);

                // create response object
                var response = new InsertArticlesResponse() {
                    ArticlesCreated = articlesToInsert,
                    AuthorsCreated = authorsToInsert,
                    ArticleTypesCreated = articleTypesToInsert,
                    ThumbnailsCreated = thumbnailsToInsert
                };

                return new HttpResponseMessage(HttpStatusCode.OK) {
                    Content = new StringContent(JsonConvert.SerializeObject(response), Encoding.UTF8, "application/json")
                };
            }
            catch (Exception ex) {
                var errorMsg = $"Error inserting articles: {ex.Message}\n\n\nLast SQL query: {DbManager.LastSqlQuery}";
                Console.WriteLine(errorMsg);
                return new HttpResponseMessage(HttpStatusCode.InternalServerError) {
                    Content = new StringContent(errorMsg, Encoding.UTF8, "application/json")
                };
            }
        }


        private static void InitDbManager()
        {
            if(ArticleFunctions.dbManager == null) {
                ArticleFunctions.dbManager = new DbManager();
            }
        }
    }
}
