using Microsoft.AspNetCore.Mvc;

using VideoGameArchive.Core;
using VideoGameArchive.Data;
using VideoGameArchive.Data.DB;
using VideoGameArchive.Entities;

namespace RestApi.Controllers;

[ApiController]
[Route("[controller]")]
public class GetDatesByFilterController : ControllerBase
{

    private readonly ILogger<GetDatesByFilterController> log;

    public GetDatesByFilterController(ILogger<GetDatesByFilterController> logger)
    {
        log = logger;
    }

    [HttpGet(Name = "GetDatesByFilter")]
    public List<int> Get()
    {
        log.LogInformation("GetDatesByFilter processed a request.");

        var db = new ArticlesManager();
        var datesWithArticles = db.GetDatesWithArticles(start, end);

        return datesWithArticles;
    }
}
