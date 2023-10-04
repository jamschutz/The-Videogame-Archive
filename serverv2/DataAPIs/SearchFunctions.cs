using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Linq;
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
    public static class SearchFunctions
    {

        [FunctionName("InsertSearchResults")]
        public static async Task<HttpResponseMessage> InsertSearchResults(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("InsertSearchResults processed a request.");

            var reqBody = await new StreamReader(req.Body).ReadToEndAsync();
            var searchResults = JsonConvert.DeserializeObject<List<SearchResult>>(reqBody);

            log.LogInformation("got search reuslts :)");

            // get articles
            var dbManager = new SearchTableManager(log);
            var entriesCreated = new List<SearchResultEntry>();

            log.LogInformation("formatting entries");
            foreach(var result in searchResults) {
                log.LogInformation("inserting...");
                entriesCreated.AddRange(dbManager.InsertSearchResult(result));
            }

            // format and return
            var response = JsonConvert.SerializeObject(entriesCreated);
            return new HttpResponseMessage(HttpStatusCode.OK) {
                Content = new StringContent(response, Encoding.UTF8, "application/json")
            };
        }


        [FunctionName("GetSearchResultMetadata")]
        public static async Task<HttpResponseMessage> GetSearchResultMetadata(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("GetSearchResultMetadata processed a request.");

            var reqBody = await new StreamReader(req.Body).ReadToEndAsync();
            var searchTerms = JsonConvert.DeserializeObject<List<string>>(reqBody);

            // get articles
            var dbManager = new SearchTableManager(log);
            var searchResults = searchTerms.Select(t => new SearchResult() { searchTerm = t}).ToList();
            var metadata = dbManager.GetSearchResultsMetadata(searchResults);

            // format and return
            var response = JsonConvert.SerializeObject(metadata);
            return new HttpResponseMessage(HttpStatusCode.OK) {
                Content = new StringContent(response, Encoding.UTF8, "application/json")
            };
        }


        [FunctionName("GetSearchResults")]
        public static HttpResponseMessage GetSearchResults(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("GetSearchResults processed a request.");

            string searchTerm = req.Query["searchTerm"];

            // get articles
            var dbManager = new SearchTableManager(log);
            var searchResults = dbManager.GetSearchResultEntries(searchTerm);
            var compressedResults = new SearchResultCompressed(searchTerm, searchResults);

            // format and return
            var response = JsonConvert.SerializeObject(compressedResults);
            return new HttpResponseMessage(HttpStatusCode.OK) {
                Content = new StringContent(response, Encoding.UTF8, "application/json")
            };
        }


        [FunctionName("SeedSearchResults")]
        public static HttpResponseMessage SeedSearchResults(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("SeedSearchResults processed a request.");

            // get articles
            var dbManager = new SearchTableManager(log);
            int articleId = 100000000;
            int startPos  = 100000;

            try {
                for(int j = 0; j < 10000; j++) {
                    var searchResults = new SearchResult() { 
                        searchTerm = "test",
                        articleIds = new List<int>(),
                        startPositions = new List<int>()
                    };
                    for(int i = 0; i < 100; i++) {
                        searchResults.articleIds.Add(articleId);
                        searchResults.startPositions.Add(startPos);

                        articleId++;
                    }

                    log.LogInformation($"inserting through articleIds {articleId}...");
                    dbManager.InsertSearchResult(searchResults);
                }
            }
            catch(Exception ex) {
                log.LogInformation($"ERROR: {ex.Message}");
            }

            // format and return
            var response = "success :)";
            return new HttpResponseMessage(HttpStatusCode.OK) {
                Content = new StringContent(response, Encoding.UTF8, "application/json")
            };
        }


        // [FunctionName("ClearSearchResults")]
        // public static HttpResponseMessage ClearSearchResults(
        //     [HttpTrigger(AuthorizationLevel.Function, "post", Route = null)] HttpRequest req,
        //     ILogger log)
        // {
        //     log.LogInformation("ClearSearchResults processed a request.");

        //     // get articles
        //     InitDbManager();
        //     dbManager.DeleteAllEntities();
        //     return new HttpResponseMessage(HttpStatusCode.OK) {
        //         Content = new StringContent("success!", Encoding.UTF8, "application/json")
        //     };
        // }
    }
}
