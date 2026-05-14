using Microsoft.EntityFrameworkCore;
using CNPM_TTN.Entities;
using CNPM_TTN.Repositories;
using CNPM_TTN.Services;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<ShopCoffeeContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("ShopCoffeeContext") ??
        builder.Configuration.GetConnectionString("Data") ??
        // Last fallback: hardcoded name used by EF scaffolding in ShopCoffeeContext.cs
        "Server=CẢNHHIỆP273;Database=Dataset;Trusted_Connection=True;TrustServerCertificate=True"));

builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

// 1. Thêm cấu hình CORS để Frontend không bị block
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.WithOrigins("http://localhost:5173") // Khai báo chính xác cổng của Frontend
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

// 2. Đăng ký IProductService
builder.Services.AddScoped<IProductService, ProductService>();

// 3. Cấu hình giữ nguyên viết hoa (PascalCase) cho JSON trả về Frontend
builder.Services.AddControllers().AddJsonOptions(options =>
    options.JsonSerializerOptions.PropertyNamingPolicy = null);
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();
