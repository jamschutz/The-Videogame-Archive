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

// delete...!
using Npgsql;

using VideoGameArchive.Core;
using VideoGameArchive.Data;
using VideoGameArchive.Data.DB;
using VideoGameArchive.Entities;
using VideoGameArchive.Responses;


namespace VideoGameArchive
{
    public static class ArticleFunctions
    {
        [FunctionName("GetArticles")]
        public static HttpResponseMessage GetArticles(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("GetArticles processed a request.");

            // process parameters
            string rawDate = req.Query["date"];
            string endDateParam = req.Query["endDate"];

            // convert to what we want
            var date = new CalendarDate(rawDate);
            var endDate = string.IsNullOrEmpty(endDateParam)? null : new CalendarDate(endDateParam);

            // get articles from db
            var db = new ArticlesManager();
            var articles = endDate == null? 
                            db.GetArticlesForDate(date.ToNumber()) :
                            db.GetArticlesBetweenDates(date.ToNumber(), endDate.ToNumber());

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
            var db = new ArticlesManager();
            var articles = db.GetArticlesWithIds(articleIds);

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
            int startDate, endDate;
            try {
                startDate = int.Parse(start);
                endDate = int.Parse(end);
            }
            catch {
                // throw error if they aren't, and return
                log.LogError($"DatesWithArticles got a bad start or end date: {start}, {end}");
                return new HttpResponseMessage(HttpStatusCode.BadRequest) {
                    Content = new StringContent("Bad request: start and end must be numbers", Encoding.UTF8, "application/json")
                };
            }

            // convert to what we want
            var db = new ArticlesManager();
            var datesWithArticles = db.GetDatesWithArticles(startDate, endDate);

            // format and return
            var response = JsonConvert.SerializeObject(datesWithArticles);
            return new HttpResponseMessage(HttpStatusCode.OK) {
                Content = new StringContent(response, Encoding.UTF8, "application/json")
            };
        }
    }
}
