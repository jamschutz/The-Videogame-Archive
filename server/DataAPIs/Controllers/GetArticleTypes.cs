using Microsoft.AspNetCore.Mvc;

using VideoGameArchive.Core;
using VideoGameArchive.Data;
using VideoGameArchive.Data.DB;
using VideoGameArchive.Entities;

namespace RestApi.Controllers;

[ApiController]
[Route("[controller]")]
public class GetArticleTypesController : ControllerBase
{

    private readonly ILogger<GetArticleTypesController> log;

    public GetArticleTypesController(ILogger<GetArticleTypesController> logger)
    {
        log = logger;
    }

    [HttpGet(Name = "GetArticleTypes")]
    public List<ArticleType> Get()
    {
        log.LogInformation("GetArticleTypes processed a request.");

        // get articles from db
        var db = new ArticleTypesManager();
        var articleTypes = db.GetArticleTypes();

        return articleTypes;
    }
}
