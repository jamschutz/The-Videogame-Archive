var AllowLocalConnections = "allowLocalConnections";
var builder = WebApplication.CreateBuilder(args);

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
            // policy.WithOrigins("http://localhost:8080");
        }
    );
});

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
