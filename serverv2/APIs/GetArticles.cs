using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

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
    public static class GetArticles
    {
        [FunctionName("GetArticles")]
        public static async Task<HttpResponseMessage> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)] HttpRequest req,
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
            var dbManager = new DbManager();
            var articles = dbManager.GetArticlesForDate(date.ToUrlString());

            // format and return
            var response = JsonConvert.SerializeObject(articles);
            return new HttpResponseMessage(HttpStatusCode.OK) {
                Content = new StringContent(response, Encoding.UTF8, "application/json")
            };
        }
    }
}
