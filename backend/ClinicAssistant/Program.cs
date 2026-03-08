using ClinicAssistant.AudioTranscribers;
using ClinicAssistant.Configuration;
using ClinicAssistant.Controller.Interfaces;
using ClinicAssistant.Controller.Middleware;
using ClinicAssistant.Repository;
using ClinicAssistant.Service;
using ClinicAssistant.Service.Interfaces;
using ClinicAssistant.WebSockets;
using log4net;

namespace ClinicAssistant;

public class Program
{
    private static readonly ILog StartupLog = LogManager.GetLogger(typeof(Program));

    public static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        builder.Services.AddControllers()
            .AddApplicationPart(typeof(ClinicAssistant.Controller.Controllers.TranscriptionController).Assembly);

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

        builder.Services.Configure<WhisperSettings>(builder.Configuration.GetSection("WhisperSettings"));

        var whisperSettings = builder.Configuration
            .GetSection("WhisperSettings")
            .Get<WhisperSettings>()
            ?? throw new InvalidOperationException("WhisperSettings section is missing in appsettings.json.");

        builder.Services.AddSingleton<ITranscriptionRepository, InMemoryTranscriptionRepository>();
        builder.Services.AddScoped<ITranscriptionService, TranscriptionService>();
        builder.Services.AddSingleton<ITranscriptPublisher, SignalRTranscriptPublisher>();

        if (whisperSettings.UseStub)
        {
            builder.Services.AddSingleton<IAudioTranscriber, StubAudioTranscriber>();
        }
        else
        {
            builder.Services.AddSingleton<IAudioTranscriber, WhisperAudioTranscriber>();
        }

        var app = builder.Build();

        app.UseWebSockets();

        app.UseMiddleware<GlobalExceptionMiddleware>();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseCors(AppAllowSpecificOrigins);

        app.UseAuthorization();

        app.MapControllers();
        app.MapHub<TranscriptionHub>("/hubs/transcription");

        app.Map("/ws/audio/{sessionId:guid}", async (HttpContext ctx, Guid sessionId, IServiceScopeFactory sf) =>
            await AudioWebSocketHandler.HandleAsync(ctx, sessionId, sf));

        if (!whisperSettings.UseStub)
        {
            StartupLog.Info("Initializing Whisper model at startup...");
            app.Services.GetRequiredService<IAudioTranscriber>();
            StartupLog.Info("Whisper model ready.");
        }

        await app.RunAsync();
    }
}
