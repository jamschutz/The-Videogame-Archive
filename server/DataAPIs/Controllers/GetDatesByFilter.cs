using Microsoft.AspNetCore.Mvc;

using Newtonsoft.Json;

using VideoGameArchive.Core;
using VideoGameArchive.Data;
using VideoGameArchive.Data.DB;
using VideoGameArchive.Entities;
using VideoGameArchive.Requests;

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
    public async Task<List<int>> Get()
    {
        log.LogInformation("GetDatesByFilter processed a request.");

        List<int> dates;
        using (var reader = new StreamReader(Request.Body, encoding: System.Text.Encoding.UTF8, detectEncodingFromByteOrderMarks: false))
        {
            // parse request
            var json = await reader.ReadToEndAsync();
            var req = JsonConvert.DeserializeObject<GetDatesByFilterRequest>(json);
            
            
            // get dates from db
            var db = new ArticlesManager();
            dates = db.GetDatesByFilter(req.include, req.exclude);
        }
    
        return dates;
    }
}
