var AllowLocalConnections = "allowLocalConnections";
var builder = WebApplication.CreateBuilder(args);

// parse client id and secret from arguments
string clientId = "", clientSecret = "", projectId = "", environment = "dev";
foreach(var arg in args) {
    var key = arg.Split("=")[0];
    var value = arg.Split("=")[1];

    switch(key) {
        case "client-id":
            clientId = value;
            break;
        case "client-secret":
            clientSecret = value;
            break;
        case "env":
            environment = value;
            break;
        case "project-id":
            projectId = value;
            break;
        default:
            throw new System.Exception($"ERROR: unknown key in arguments found. key was: ${key}");
    }
}

// // make sure client id and secret are set
// if(clientId == "" || clientSecret == "" || projectId == "") {
//     throw new System.Exception($"ERROR: you must pass client-id, client-secret, and project-id as arguments");
// }

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// add CORS policy
builder.Services.AddCors(options => {
    options.AddPolicy(
        name: AllowLocalConnections,
        policy => {
            policy.SetIsOriginAllowed(origin => new Uri(origin).Host == "localhost").AllowAnyHeader().AllowAnyMethod();
        }
    );
});

// VideoGameArchive.Core.SecretsManager.Init(clientId, clientSecret, projectId, environment);

var app = builder.Build(); 

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors(AllowLocalConnections);

app.UseAuthorization();

app.MapControllers();

app.Run();
