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
    public static class SearchFunctions
    {
        private static DbManager dbManager;


        // [FunctionName("InsertSearchResults")]
        // public static async Task<HttpResponseMessage> InsertSearchResults(
        //     [HttpTrigger(AuthorizationLevel.Function, "post", Route = null)] HttpRequest req,
        //     ILogger log)
        // {
        //     log.LogInformation("InsertSearchResults processed a request.");

        //     var mongo = new MongoDbManager();

        //     return new HttpResponseMessage(HttpStatusCode.OK) {
        //         Content = new StringContent("done", Encoding.UTF8, "application/json")
        //     };
        // }


        private static void InitDbManager()
        {
            if(SearchFunctions.dbManager == null) {
                SearchFunctions.dbManager = new DbManager();
            }
        }
    }
}
