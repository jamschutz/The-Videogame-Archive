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

namespace VideoGameArchive
{
    public static class ArticleFunctions
    {
        private static DbManager dbManager;


        [FunctionName("GetArticles")]
        public static async Task<HttpResponseMessage> GetArticles(
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


        [FunctionName("DatesWithArticles")]
        public static async Task<HttpResponseMessage> GetDatesWithArticles(
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
            catch (Exception ex) {
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

            Console.WriteLine("getting params..");
            var reqBody = await new StreamReader(req.Body).ReadToEndAsync();
            var articles = JsonConvert.DeserializeObject<List<Article>>(reqBody);

            InitDbManager();

            Console.WriteLine("getting data from db..");
            // get list of data we need to insert before the articles
            var articlesToInsert     = ArticleFunctions.dbManager.GetArticlesNotInDb(articles);
            var authorsToInsert      = ArticleFunctions.dbManager.GetAuthorsNotInDb(articles);
            var articleTypesToInsert = ArticleFunctions.dbManager.GetArticleTypesNotInDb(articles);

            // insert data articles depend on first
            Console.WriteLine("at insert..");
            ArticleFunctions.dbManager.InsertAuthors(authorsToInsert);
            ArticleFunctions.dbManager.InsertArticleTypes(articleTypesToInsert);

            return new HttpResponseMessage(HttpStatusCode.OK) {
                Content = new StringContent(string.Join(", ", articleTypesToInsert), Encoding.UTF8, "application/json")
            };
        }


        [FunctionName("InsertSearchResults")]
        public static async Task<HttpResponseMessage> InsertSearchResults(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("InsertSearchResults processed a request.");

            var mongo = new MongoDbManager();

            return new HttpResponseMessage(HttpStatusCode.OK) {
                Content = new StringContent("done", Encoding.UTF8, "application/json")
            };
        }


        private static void InitDbManager()
        {
            if(ArticleFunctions.dbManager == null) {
                ArticleFunctions.dbManager = new DbManager();
            }
        }
    }
}
