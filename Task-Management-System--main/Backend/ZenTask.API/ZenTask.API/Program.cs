
using ZenTask.API.Data;
using ZenTask.API.Models;
using ZenTask.API.Middleware;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/tasklog.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options => {
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 4;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;
    options.User.RequireUniqueEmail = true;
})
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

// Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

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
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/taskHub"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
});

var app = builder.Build();

// Apply migrations on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.Migrate();
        Log.Information("Database check/migration completed successfully.");

        // Data Cleanup: Ensure unique emails
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var allUsers = userManager.Users.ToList();
        var emailGroups = allUsers.GroupBy(u => u.Email?.ToLower()).Where(g => g.Count() > 1 && g.Key != null).ToList();

        if (emailGroups.Any())
        {
            Log.Warning("Detected {Count} groups of duplicate emails. Cleaning up...", emailGroups.Count);
            foreach (var group in emailGroups)
            {
                var users = group.OrderBy(u => u.JoinDate).ToList();
                // Keep the first one, update others
                for (int i = 1; i < users.Count; i++)
                {
                    var u = users[i];
                    u.Email = $"duplicate_{i}_{Guid.NewGuid().ToString().Substring(0, 4)}_{u.Email}";
                    u.NormalizedEmail = u.Email.ToUpper();
                    context.Update(u);
                    Log.Information("Updated duplicate email for user {Username} to {NewEmail}", u.UserName, u.Email);
                }
            }
            context.SaveChanges();
            Log.Information("Data cleanup completed.");
        }
    }
    catch (Exception ex)
    {
        Log.Error(ex, "An error occurred during startup data processing.");
    }
}

// Global Exception Handling
app.UseGlobalExceptionHandler();

app.UseCors("AllowAll");

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ZenTask.API.Hubs.TaskHub>("/taskHub");

app.Run();