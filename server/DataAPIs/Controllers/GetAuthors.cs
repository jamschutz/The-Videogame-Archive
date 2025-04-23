using Microsoft.AspNetCore.Mvc;

using VideoGameArchive.Core;
using VideoGameArchive.Data;
using VideoGameArchive.Data.DB;
using VideoGameArchive.Entities;

namespace RestApi.Controllers;

[ApiController]
[Route("[controller]")]
public class GetAuthorsController : ControllerBase
{

    private readonly ILogger<GetAuthorsController> log;

    public GetAuthorsController(ILogger<GetAuthorsController> logger)
    {
        log = logger;
    }

    [HttpGet(Name = "GetAuthors")]
    public List<Author> Get()
    {
        log.LogInformation("GetAuthors processed a request.");

        // get articles from db
        var db = new AuthorsManager();
        var authors = db.GetAuthors();

        return authors;
    }
}
