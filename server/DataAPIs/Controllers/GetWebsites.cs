using Microsoft.AspNetCore.Mvc;

using VideoGameArchive.Core;
using VideoGameArchive.Data;
using VideoGameArchive.Data.DB;
using VideoGameArchive.Entities;

namespace RestApi.Controllers;

[ApiController]
[Route("[controller]")]
public class GetWebsitesController : ControllerBase
{

    private readonly ILogger<GetWebsitesController> log;

    public GetWebsitesController(ILogger<GetWebsitesController> logger)
    {
        log = logger;
    }

    [HttpGet(Name = "GetWebsites")]
    public List<Website> Get()
    {
        log.LogInformation("GetWebsites processed a request.");

        // get articles from db
        var db = new WebsitesManager();
        var websites = db.GetWebsites();

        return websites;
    }
}
