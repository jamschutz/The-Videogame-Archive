using Microsoft.AspNetCore.Mvc;

using VideoGameArchive.Core;
using VideoGameArchive.Data;
using VideoGameArchive.Data.DB;
using VideoGameArchive.Entities;
using VideoGameArchive.Responses;

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

    [HttpGet(Name = "GetSearchResults")]
    public async Task<GetSearchResultsResponse> Get(
        [FromQuery] string searchTerms,
        [FromQuery] int resultsPerPage,
        [FromQuery] int pageNumber = 1
    )
    {
        log.LogInformation("GetSearchResults processed a request.");

        var tokens = searchTerms.Split(' ');

        log.LogInformation($"got search terms: {string.Join(",", tokens)}");

        // get articles
        var dbManager = new ArticlesManager();

        // get results and total count in parallel
        int skip = (pageNumber - 1) * resultsPerPage;
        var searchResultsTask = Task.Run(() => dbManager.GetSearchResults(tokens, skip, resultsPerPage));
        var totalCountTask = Task.Run(() => dbManager.GetSearchResultsTotalCount(tokens));

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
