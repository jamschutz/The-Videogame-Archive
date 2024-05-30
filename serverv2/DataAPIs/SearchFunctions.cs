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
using Microsoft.WindowsAzure.Storage;

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
            var searchRequest = JsonConvert.DeserializeObject<InsertSearchResultsRequest>(reqBody);

            log.LogInformation($"got {searchRequest.entries.Count} search results for '{searchRequest.searchTerm}'");

            // get articles
            var dbManager = new SearchTableManager(log);
            var entriesCreated = dbManager.InsertSearchResult(searchRequest.searchTerm, searchRequest.entries);

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
            var metadata = dbManager.GetSearchResultsMetadata(searchTerms);

            // format and return
            var response = JsonConvert.SerializeObject(metadata);
            return new HttpResponseMessage(HttpStatusCode.OK) {
                Content = new StringContent(response, Encoding.UTF8, "application/json")
            };
        }


        [FunctionName("GetSearchResults")]
        public static HttpResponseMessage GetSearchResults(
            [HttpTrigger(AuthorizationLevel.Function, "get", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("GetSearchResults processed a request.");

            var searchTerms = ((string)req.Query["searchTerms"]).Split(' ').Select(t => t.ToLower()).ToArray();
            int resultsPerPage = int.Parse(req.Query["resultsPerPage"]);
            int pageNumber = int.Parse(req.Query["page"]);
            if(pageNumber < 1) pageNumber = 1;

            // get articles
            var dbManager = new SearchTableManager(log);
            var searchResults = new Dictionary<int, List<int>>();

            // if only one search term, just store the one result
            if(searchTerms.Length == 1) {
                searchResults = dbManager.GetSearchResultEntries(searchTerms[0], resultsPerPage, pageNumber);
            }

            // otherwise, get articles that have all search terms
            else {
                var allSearchResults = new List<Dictionary<int, List<int>>>();
                foreach(var searchTerm in searchTerms) {
                    allSearchResults.Add(dbManager.GetSearchResultEntries(searchTerm));
                }

                var matchingArticleIds = allSearchResults[0].Keys.ToList();
                for(int i = 1; i < allSearchResults.Count; i++) {
                    matchingArticleIds = matchingArticleIds.Intersect(allSearchResults[i].Keys.ToList()).ToList();
                }

                foreach(var id in matchingArticleIds) {
                    foreach(var searchResult in allSearchResults) {
                        if(searchResult.ContainsKey(id)) {
                            if(!searchResults.ContainsKey(id)) {
                                searchResults[id] = new List<int>();
                            }

                            searchResults[id].AddRange(searchResult[id]);
                        }
                    }
                }
            }

            // get articles
            var articleDbManager = new DbManager_OLD();
            var articleIdsToFetch = searchResults.Keys.Skip(resultsPerPage * (pageNumber - 1)).Take(resultsPerPage).ToList();
            var articles = searchResults.Keys.Count > 0? articleDbManager.GetArticlesForIds(articleIdsToFetch) : new List<Article>();

            System.Console.WriteLine(String.Join(",", articleIdsToFetch));

            // format and return
            var response = JsonConvert.SerializeObject(new GetSearchResultsResponse() {
                TotalResults = searchResults.Keys.Count,
                Results = articles
            });
            return new HttpResponseMessage(HttpStatusCode.OK) {
                Content = new StringContent(response, Encoding.UTF8, "application/json")
            };
        }


        // [FunctionName("SeedSearchResults")]
        // public static HttpResponseMessage SeedSearchResults(
        //     [HttpTrigger(AuthorizationLevel.Function, "post", Route = null)] HttpRequest req,
        //     ILogger log)
        // {
        //     log.LogInformation("SeedSearchResults processed a request.");

        //     // get articles
        //     var dbManager = new SearchTableManager(log);
        //     int articleId = 100000000;
        //     int startPos  = 100000;

        //     // try {
        //     //     for(int j = 0; j < 10000; j++) {
        //     //         var searchResults = new SearchResult() { 
        //     //             searchTerm = "test",
        //     //             articleIds = new List<int>(),
        //     //             startPositions = new List<int>()
        //     //         };
        //     //         for(int i = 0; i < 100; i++) {
        //     //             searchResults.articleIds.Add(articleId);
        //     //             searchResults.startPositions.Add(startPos);

        //     //             articleId++;
        //     //         }

        //     //         log.LogInformation($"inserting through articleIds {articleId}...");
        //     //         dbManager.InsertSearchResult(searchResults);
        //     //     }
        //     // }
        //     // catch(Exception ex) {
        //     //     log.LogInformation($"ERROR: {ex.Message}");
        //     // }

        //     // format and return
        //     var response = "success :)";
        //     return new HttpResponseMessage(HttpStatusCode.OK) {
        //         Content = new StringContent(response, Encoding.UTF8, "application/json")
        //     };
        // }


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
