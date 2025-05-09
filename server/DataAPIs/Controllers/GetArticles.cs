using Microsoft.AspNetCore.Mvc;

using VideoGameArchive.Core;
using VideoGameArchive.Data;
using VideoGameArchive.Data.DB;
using VideoGameArchive.Entities;

namespace RestApi.Controllers;

[ApiController]
[Route("[controller]")]
public class GetArticlesController : ControllerBase
{

    private readonly ILogger<GetArticlesController> log;

    public GetArticlesController(ILogger<GetArticlesController> logger)
    {
        log = logger;
    }

    [HttpGet(Name = "GetArticles")]
    public List<Article> Get(
        [FromQuery] string date,
        [FromQuery] string endDate = ""
    )
    {
        log.LogInformation("GetArticles processed a request.");

        // convert to what we want
        var parsedDate = new CalendarDate(date);
        var parsedEndDate = string.IsNullOrEmpty(endDate)? null : new CalendarDate(endDate);

        // get articles from db
        var db = new ArticlesManager();
        var articles = parsedEndDate == null? 
                        db.GetArticlesForDate(parsedDate.ToNumber()) :
                        db.GetArticlesBetweenDates(parsedDate.ToNumber(), parsedEndDate.ToNumber());

        return articles;
    }
}
