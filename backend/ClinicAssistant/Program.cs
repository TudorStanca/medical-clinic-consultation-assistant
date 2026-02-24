using ClinicAssistant.Middleware;

namespace ClinicAssistant;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        builder.Services.AddControllers();

        // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        builder.Services.AddSignalR();

        var AppAllowSpecificOrigins = "_appAllowSpecificOrigins";

        builder.Services.AddCors(options =>
        {
            options.AddPolicy(name: AppAllowSpecificOrigins, policy =>
            {
                policy.AllowAnyHeader().AllowAnyOrigin().AllowAnyMethod();
            });
        });

        builder.Logging.ClearProviders();
        builder.Logging.AddLog4Net("log4net.config");

        var app = builder.Build();

        app.UseMiddleware<GlobalExceptionMiddleware>();

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();

        app.UseAuthorization();

        app.UseCors(AppAllowSpecificOrigins);

        app.MapControllers();

        app.Run();
    }
}
