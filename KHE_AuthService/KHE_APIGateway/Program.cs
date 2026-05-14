using Ocelot.DependencyInjection;
using Ocelot.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);
builder.Services.AddOcelot();
builder.Services.AddControllers();

// Thêm CORS vào ðây
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Th? t? quan tr?ng
app.UseCors("AllowAll");          // 1. CORS trý?c tiên
// app.UseHttpsRedirection();     // 2. comment l?i
app.UseAuthorization();           // 3. Auth
await app.UseOcelot();            // 4. Ocelot cu?i cùng

app.Run();