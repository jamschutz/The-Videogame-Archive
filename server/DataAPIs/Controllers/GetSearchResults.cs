using Microsoft.AspNetCore.Mvc;

using Newtonsoft.Json;

using VideoGameArchive.Core;
using VideoGameArchive.Data;
using VideoGameArchive.Data.DB;
using VideoGameArchive.Entities;
using VideoGameArchive.Responses;
using VideoGameArchive.Requests;

namespace RestApi.Controllers;

[ApiController]
[Route("[controller]")]
public class GetSearchResultsController : ControllerBase
{

    private readonly ILogger<GetSearchResultsController> log;

    public GetSearchResultsController(ILogger<GetSearchResultsController> logger)
    {
        log = logger;
    }

    [HttpPost(Name = "GetSearchResults")]
    public async Task<GetSearchResultsResponse> Post()
    {
        log.LogInformation("GetSearchResults processed a request.");

        using (var reader = new StreamReader(Request.Body, encoding: System.Text.Encoding.UTF8, detectEncodingFromByteOrderMarks: false))
        {
            // parse request
            var json = await reader.ReadToEndAsync();
            var req = JsonConvert.DeserializeObject<GetSearchResultsRequest>(json);
            
            log.LogInformation($"got search terms: {string.Join(",", req.searchTerms)}");

            // get articles
            var dbManager = new ArticlesManager();

            // get results and total count in parallel
            int skip = (req.page - 1) * req.resultsPerPage;
            var searchResultsTask = Task.Run(() => dbManager.GetSearchResults(req.searchTerms, skip, req.resultsPerPage, req.filter));
            var totalCountTask = Task.Run(() => dbManager.GetSearchResultsTotalCount(req.searchTerms, req.filter));

            // wait for them to finish
            await Task.WhenAll(searchResultsTask, totalCountTask);
            
            // store results
            var searchResults = await searchResultsTask;
            int totalResults = await totalCountTask;

            // format and return
            return new GetSearchResultsResponse() {
                TotalResults = totalResults,
                Results = searchResults
            };
        }
    }
}
