using Microsoft.EntityFrameworkCore;
using CNPM_TTN.Entities;    
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<ShopCoffeeContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("ShopCoffeeContext") ?? throw new InvalidOperationException("Connection string 'ShopCoffeeContext' not found.")));

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
