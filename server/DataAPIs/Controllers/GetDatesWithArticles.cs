using Microsoft.AspNetCore.Mvc;

using VideoGameArchive.Core;
using VideoGameArchive.Data;
using VideoGameArchive.Data.DB;
using VideoGameArchive.Entities;

namespace RestApi.Controllers;

[ApiController]
[Route("[controller]")]
public class GetDatesWithArticlesController : ControllerBase
{

    private readonly ILogger<GetDatesWithArticlesController> log;

    public GetDatesWithArticlesController(ILogger<GetDatesWithArticlesController> logger)
    {
        log = logger;
    }

    [HttpGet(Name = "GetDatesWithArticles")]
    public List<int> Get(
        [FromQuery] int start,
        [FromQuery] int end
    )
    {
        log.LogInformation("GetDatesWithArticles processed a request.");

        var db = new ArticlesManager();
        var datesWithArticles = db.GetDatesWithArticles(start, end);

        return datesWithArticles;
    }
}
