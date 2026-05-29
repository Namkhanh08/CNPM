using CNPM_TTN;
using CNPM_TTN.Repositories;
using CNPM_TTN.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// CORS — cho phép FE truy cập
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173", "http://localhost:5174")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// Database (EF Core + SQL Server)
builder.Services.AddDbContext<CNPM_TTN.Entities.ShopCoffeeContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSettings["Key"] ?? throw new InvalidOperationException("Missing Jwt:Key configuration.");
var jwtIssuer = jwtSettings["Issuer"] ?? throw new InvalidOperationException("Missing Jwt:Issuer configuration.");
var jwtAudience = jwtSettings["Audience"] ?? throw new InvalidOperationException("Missing Jwt:Audience configuration.");
var key = Encoding.UTF8.GetBytes(jwtKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

// Dependency Injection — đăng ký Repository và Services
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IInventoryService, InventoryService>();
builder.Services.AddScoped<IUploadService, UploadService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IVoucherService, VoucherService>();
builder.Services.AddScoped<ILoyaltyService, LoyaltyService>();
builder.Services.AddScoped<ISubscriptionService, SubscriptionService>();
builder.Services.AddScoped<IRecommendationService, RecommendationService>();
builder.Services.AddHostedService<SubscriptionCronJob>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
    });
builder.Services.AddOpenApi();

var app = builder.Build();

app.UseRouting();
app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

//app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.UseStaticFiles();

// Seed Traceability Data (tách ra DbSeeder.cs cho gọn)
DbSeeder.SeedTraceabilityData(app.Services);

app.Run();
