using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

using VGA.Helpers;

namespace VGA
{
    public static class GetArticles
    {
        [FunctionName("GetArticles")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");

            string rawDate = req.Query["date"];
            string websiteParam = req.Query["websiteId"];

            var date = new CalendarDate(rawDate);
            var websiteId = string.IsNullOrEmpty(websiteParam)? -1 : int.Parse(websiteParam);

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            dynamic data = JsonConvert.DeserializeObject(requestBody);

            string responseMessage = $"got date: {date.ToDateString()}, and websiteId: {websiteId}";

            return new OkObjectResult(responseMessage);
        }
    }
}
