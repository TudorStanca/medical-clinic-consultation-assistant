using ClinicAssistant.AudioTranscribers;
using ClinicAssistant.Domain.Interfaces;
using ClinicAssistant.Middleware;
using ClinicAssistant.Repository;
using ClinicAssistant.Service;
using ClinicAssistant.WebSockets;

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

        builder.Services.AddSingleton<ITranscriptionRepository, InMemoryTranscriptionRepository>();
        builder.Services.AddSingleton<ITranscriptionService, TranscriptionService>();
        builder.Services.AddSingleton<IAudioTranscriber, StubAudioTranscriber>();
        builder.Services.AddSingleton<ITranscriptPublisher, SignalRTranscriptPublisher>();

        var audioRoot = Path.Combine(AppContext.BaseDirectory, "App_Data", "audio");

        if (Directory.Exists(audioRoot))
        {
            Directory.Delete(audioRoot, recursive: true);
        }

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
        app.MapHub<TranscriptionHub>("/hubs/transcription");

        app.Run();
    }
}
