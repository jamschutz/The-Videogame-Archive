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
    public async Task<string> Get()
    {
        log.LogInformation("GetDatesByFilter processed a request.");

        GetDatesByFilterRequest req;
        List<int> websites;
        using (var reader = new StreamReader(Request.Body, encoding: System.Text.Encoding.UTF8, detectEncodingFromByteOrderMarks: false))
        {
            var json = await reader.ReadToEndAsync();
            req = JsonConvert.DeserializeObject<GetDatesByFilterRequest>(json);
            websites = req.include.websites;
        }
    
        return string.Join(",", websites);
    }
}
