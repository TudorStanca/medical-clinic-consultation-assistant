using System.Diagnostics;
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

        app.UseCors(AppAllowSpecificOrigins);

        app.UseAuthorization();

        app.MapControllers();
        app.MapHub<TranscriptionHub>("/hubs/transcription");

        if (!whisperSettings.UseStub)
        {
            var ffmpegOk = await CheckFfmpegAsync(whisperSettings.FfmpegPath);
            if (!ffmpegOk)
            {
                StartupLog.Fatal(
                    $"FFmpeg not found at '{whisperSettings.FfmpegPath}'. " +
                    "Set WhisperSettings:FfmpegPath in appsettings.json or install FFmpeg on PATH.");
                return;
            }
            StartupLog.Info($"FFmpeg found at '{whisperSettings.FfmpegPath}'.");

            StartupLog.Info("Initializing Whisper model at startup...");
            app.Services.GetRequiredService<IAudioTranscriber>();
            StartupLog.Info("Whisper model ready.");
        }

        await app.RunAsync();
    }

    private static async Task<bool> CheckFfmpegAsync(string ffmpegPath)
    {
        try
        {
            var psi = new ProcessStartInfo
            {
                FileName = ffmpegPath,
                Arguments = "-version",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };
            using var process = Process.Start(psi);
            if (process == null)
            {
                return false;
            }

            await process.WaitForExitAsync();

            return process.ExitCode == 0;
        }
        catch
        {
            return false;
        }
    }
}
