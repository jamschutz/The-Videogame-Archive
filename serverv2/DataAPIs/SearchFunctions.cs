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
using VideoGameArchive.Data.DB;
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
            var searchRequest = JsonConvert.DeserializeObject<List<InsertSearchResultsRequest>>(reqBody);

            // insert search results
            var dbManager = new SearchTableManager(log);
            var response = new InsertSearchResultsResponse();
            var insertionTasks = new List<Task>();
            foreach(var request in searchRequest) {
                log.LogInformation($"got {request.articleIds.Count} search results for '{request.searchTerm}'");

                insertionTasks.Add(Task.Factory.StartNew(() => {
                    var entriesCreated = dbManager.InsertSearchResult(request.searchTerm, request.articleIds);
                    response.Results.Add(new SearchResultsInserted() {
                        SearchTerm = request.searchTerm,
                        ArticleIdsAdded = entriesCreated
                    });
                    log.LogInformation($"done inserting for {request.searchTerm}");
                }));
            }
            await Task.WhenAll(insertionTasks.ToArray());
            log.LogInformation($"DONE WAITING");

            // format and return
            var responseMsg = JsonConvert.SerializeObject(response);
            return new HttpResponseMessage(HttpStatusCode.OK) {
                Content = new StringContent(responseMsg, Encoding.UTF8, "application/json")
            };
        }


        [FunctionName("GetSearchResultMetadata")]
        public static HttpResponseMessage GetSearchResultMetadata(
            [HttpTrigger(AuthorizationLevel.Function, "get", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("GetSearchResultMetadata processed a request.");

            // var reqBody = await new StreamReader(req.Body).ReadToEndAsync();
            // var searchTerms = JsonConvert.DeserializeObject<List<string>>(reqBody);
            string searchTerm = req.Query["searchTerm"];

            // get articles
            var dbManager = new SearchTableManager(log);
            var metadata = dbManager.GetSearchResultMetadata(searchTerm);

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

            var searchTerms = ((string)req.Query["searchTerms"]).Split(' ').Select(t => t.ToLower().StripPunctuation()).ToArray();
            int resultsPerPage = int.Parse(req.Query["resultsPerPage"]);
            int pageNumber = int.Parse(req.Query["page"]);
            if(pageNumber < 1) pageNumber = 1;

            log.LogInformation($"got search terms: {string.Join(",", searchTerms)}");

            // get articles
            var dbManager = new ArticlesManager();

            int skip = (pageNumber - 1) * resultsPerPage;
            var searchResults = dbManager.GetSearchResults(searchTerms, skip, resultsPerPage);

            
            // // if only one search term, just store the one result
            // if(searchTerms.Length == 1) {
            //     searchResults = dbManager.GetSearchResultEntries(searchTerms[0], resultsPerPage, pageNumber);
            // }

            // // otherwise, get articles that have all search terms
            // else {
            //     // init lists
            //     var allSearchResults = new Dictionary<string, HashSet<int>>();
            //     var allArticleIds = new HashSet<int>();

            //     // for each search term, track its article ids
            //     foreach(var searchTerm in searchTerms) {
            //         // get its article ids
            //         var articleIds = dbManager.GetAllSearchResultEntries(searchTerm);

            //         // and add to our search results tracker, and our mega list of article ids
            //         allSearchResults[searchTerm] = new HashSet<int>(articleIds);
            //         foreach(var id in articleIds.Where(id => !allArticleIds.Contains(id))) {
            //             allArticleIds.Add(id);
            //         }
            //     }

            //     // find article ids that exist in ALL search terms
            //     HashSet<int> intersection = null;
            //     foreach(var searchTerm in allSearchResults.Keys) {
            //         if(intersection == null)
            //             intersection = allSearchResults[searchTerm];
            //         else
            //             intersection.IntersectWith(allSearchResults[searchTerm]);
            //     }
            //     searchResults = intersection.ToList();
            // }

            // // get articles
            // var articleDbManager = new ArticlesManager();
            // var articleIdsToFetch = searchResults.Skip(resultsPerPage * (pageNumber - 1)).Take(resultsPerPage).ToList();
            // var articles = searchResults.Count > 0? articleDbManager.GetArticlesWithIds(articleIdsToFetch) : new List<Article>();

            // format and return
            var response = JsonConvert.SerializeObject(new GetSearchResultsResponse() {
                TotalResults = dbManager.GetSearchResultsTotalCount(searchTerms),
                Results = searchResults
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
