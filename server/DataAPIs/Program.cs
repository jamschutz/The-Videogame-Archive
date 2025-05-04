var AllowLocalConnections = "allowLocalConnections";
var builder = WebApplication.CreateBuilder(args);

// parse client id and secret from arguments
if(args.Length < 4) {
    throw new System.Exception($"ERROR: expected 4 arguments, but only got ${args.Length}. please ensure to have the following arguments in the following order: client-id, client-secret, project-id, environment");
}
string clientId = args[0];
string clientSecret = args[1];
string projectId = args[2];
string environment = args[3];

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

VideoGameArchive.Core.SecretsManager.Init(clientId, clientSecret, projectId, environment);

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
