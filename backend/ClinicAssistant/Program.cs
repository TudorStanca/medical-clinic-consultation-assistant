using System.Diagnostics;
using ClinicAssistant.AudioTranscribers;
using ClinicAssistant.Configuration;
using ClinicAssistant.Controller.Interfaces;
using ClinicAssistant.Controller.Middleware;
using ClinicAssistant.Domain.Entities;
using ClinicAssistant.Domain.Validators;
using ClinicAssistant.Repository;
using ClinicAssistant.Repository.Mapping;
using ClinicAssistant.Service;
using ClinicAssistant.Service.Interfaces;
using ClinicAssistant.Service.Mapping;
using ClinicAssistant.WebSockets;
using FluentValidation;
using log4net;
using Microsoft.EntityFrameworkCore;

namespace ClinicAssistant;

public class Program
{
    private static readonly ILog StartupLog = LogManager.GetLogger(typeof(Program));

    public static async Task Main(string[] args)
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
                policy.AllowAnyHeader()
                      .WithOrigins("http://localhost:5056", "http://localhost:5173")
                      .AllowAnyMethod()
                      .AllowCredentials();
            });
        });

        builder.Logging.ClearProviders();
        builder.Logging.AddLog4Net("log4net.config");

        // EF Core + PostgreSQL
        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

        // ASP.NET Core Identity (UserManager for password hashing)
        builder.Services.AddIdentityCore<AppUser>()
            .AddEntityFrameworkStores<AppDbContext>();

        // AutoMapper
        builder.Services.AddAutoMapper(cfg =>
        {
            cfg.AddProfile<EFEntitiesMappingProfile>();
            cfg.AddProfile<AutoMapperServiceProfile>();
        });

        // FluentValidation
        builder.Services.AddValidatorsFromAssemblyContaining<DoctorPostDTOValidator>();

        builder.Services.Configure<WhisperSettings>(builder.Configuration.GetSection("WhisperSettings"));

        var whisperSettings = builder.Configuration
            .GetSection("WhisperSettings")
            .Get<WhisperSettings>()
            ?? throw new InvalidOperationException("WhisperSettings section is missing in appsettings.json.");

        // Repositories (Scoped)
        builder.Services.AddScoped<IConsultationSessionRepository, ConsultationSessionRepository>();
        builder.Services.AddScoped<IMedicalLetterRepository, MedicalLetterRepository>();
        builder.Services.AddScoped<IUploadedDocumentRepository, UploadedDocumentRepository>();
        builder.Services.AddScoped<IUserRepository, UserRepository>();

        // Services (Scoped)
        builder.Services.AddScoped<IConsultationSessionService, ConsultationSessionService>();
        builder.Services.AddScoped<IDoctorService, DoctorService>();
        builder.Services.AddScoped<IPatientService, PatientService>();
        builder.Services.AddScoped<IUploadedDocumentService, UploadedDocumentService>();

        // SignalR publisher (Singleton — stateless)
        builder.Services.AddSingleton<ITranscriptPublisher, SignalRTranscriptPublisher>();

        // Audio transcriber (Singleton — holds Whisper model in memory)
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
