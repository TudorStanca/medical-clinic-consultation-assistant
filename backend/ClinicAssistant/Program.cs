using System.Text;
using ClinicAssistant.AudioTranscribers;
using QuestPDF.Infrastructure;
using ClinicAssistant.Configuration;
using ClinicAssistant.Controller.Interfaces;
using ClinicAssistant.Controller.Middleware;
using ClinicAssistant.Domain.Constants;
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
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

namespace ClinicAssistant;

public class Program
{
    private static readonly ILog StartupLog = LogManager.GetLogger(typeof(Program));

    public static async Task Main(string[] args)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        builder.Services.AddControllers();

        builder.Services.Configure<ApiBehaviorOptions>(options =>
        {
            options.InvalidModelStateResponseFactory = context =>
            {
                var errors = context.ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage);

                return new UnprocessableEntityObjectResult(new
                {
                    statusCode = 422,
                    message = "Validation failed.",
                    errors
                });
            };
        });

        // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(options =>
        {
            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Enter your JWT token (without the 'Bearer ' prefix)"
            });
            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                    },
                    Array.Empty<string>()
                }
            });
        });

        builder.Services.AddSignalR();

        var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
            ?? throw new InvalidOperationException("AllowedOrigins section is missing in appsettings.json.");

        var AppAllowSpecificOrigins = "_appAllowSpecificOrigins";

        builder.Services.AddCors(options =>
        {
            options.AddPolicy(name: AppAllowSpecificOrigins, policy =>
            {
                policy.AllowAnyHeader()
                      .WithOrigins(allowedOrigins)
                      .AllowAnyMethod()
                      .AllowCredentials();
            });
        });

        builder.Logging.ClearProviders();
        builder.Logging.AddLog4Net("log4net.config");

        // EF Core + PostgreSQL
        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

        // ASP.NET Core Identity
        builder.Services.AddIdentityCore<AppUser>()
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<AppDbContext>();

        // AutoMapper
        builder.Services.AddAutoMapper(cfg =>
        {
            cfg.AddProfile<EFEntitiesMappingProfile>();
            cfg.AddProfile<AutoMapperServiceProfile>();
        });

        // FluentValidation
        builder.Services.AddValidatorsFromAssemblyContaining<DoctorPostDTOValidator>();
        builder.Services.AddValidatorsFromAssemblyContaining<ConsultationSessionService>();

        builder.Services.Configure<WhisperSettings>(builder.Configuration.GetSection("WhisperSettings"));
        builder.Services.Configure<FileStorageSettings>(builder.Configuration.GetSection("FileStorageSettings"));
        builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
        builder.Services.Configure<AdminSettings>(builder.Configuration.GetSection("AdminSettings"));
        builder.Services.Configure<LlmSettings>(builder.Configuration.GetSection("LlmSettings"));

        var whisperSettings = builder.Configuration
            .GetSection("WhisperSettings")
            .Get<WhisperSettings>()
            ?? throw new InvalidOperationException("WhisperSettings section is missing in appsettings.json.");

        var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>()
            ?? throw new InvalidOperationException("JwtSettings missing.");

        var llmSettings = builder.Configuration.GetSection("LlmSettings").Get<LlmSettings>()
            ?? throw new InvalidOperationException("LlmSettings missing.");

        // JWT Authentication
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
                ValidIssuer = jwtSettings.Issuer,
                ValidAudience = jwtSettings.Audience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
                ClockSkew = TimeSpan.Zero
            };
        });

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
        builder.Services.AddScoped<IAuthService, AuthService>();
        builder.Services.AddScoped<IMedicalLetterService, MedicalLetterService>();
        builder.Services.AddScoped<MedicalLetterPdfGenerator>();

        // Document text extractors (Singleton — stateless)
        builder.Services.AddSingleton<IDocumentTextExtractor, TxtDocumentTextExtractor>();
        builder.Services.AddSingleton<IDocumentTextExtractor, PdfDocumentTextExtractor>();
        builder.Services.AddSingleton<DocumentTextExtractorResolver>();

        // LLM service (Scoped — ClaudeService uses typed HttpClient; Stub is lightweight)
        if (llmSettings.UseStub)
        {
            builder.Services.AddScoped<ILlmService, StubLlmService>();
        }
        else
        {
            builder.Services.AddHttpClient<ILlmService, ClaudeService>();
        }

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

        await SeedAsync(app);
        await CleanupInterruptedSessionsAsync(app);

        app.UseWebSockets();

        app.UseMiddleware<GlobalExceptionMiddleware>();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseCors(AppAllowSpecificOrigins);

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();
        app.MapHub<TranscriptionHub>("/hubs/transcription");

        app.Map("/ws/audio/{sessionId:guid}", async (HttpContext ctx, Guid sessionId, IServiceScopeFactory sf) =>
            await AudioWebSocketHandler.HandleAsync(ctx, sessionId, sf));

        if (app.Environment.IsDevelopment())
        {
            app.MapPost("/api/dev/sessions/{sessionId:guid}/inject-transcript",
                async (Guid sessionId, DevInjectTranscriptRequest body, IConsultationSessionRepository sessionRepo) =>
                {
                    var session = await sessionRepo.GetByIdAsync(sessionId);
                    if (session is null)
                    {
                        return Results.NotFound(new { message = $"Session {sessionId} not found." });
                    }

                    var segment = new TranscriptSegment
                    {
                        StartMs = 0,
                        EndMs = 0,
                        Text = body.Transcript,
                        SessionId = sessionId
                    };

                    await sessionRepo.AddSegmentsAsync([segment]);
                    session.MarkDone();
                    await sessionRepo.UpdateAsync(session);

                    return Results.NoContent();
                })
                .AllowAnonymous();
        }

        if (!whisperSettings.UseStub)
        {
            StartupLog.Info("Initializing Whisper model at startup...");
            app.Services.GetRequiredService<IAudioTranscriber>();
            StartupLog.Info("Whisper model ready.");
        }

        await app.RunAsync();
    }

    private static async Task CleanupInterruptedSessionsAsync(WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var sessionRepo = scope.ServiceProvider.GetRequiredService<IConsultationSessionRepository>();
        var count = await sessionRepo.MarkActiveAsInterruptedAsync();
        if (count > 0)
        {
            StartupLog.Warn($"Startup cleanup: marked {count} active session(s) as Interrupted.");
        }
    }

    private static async Task SeedAsync(WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
        var adminSettings = scope.ServiceProvider.GetRequiredService<IOptions<AdminSettings>>().Value;

        foreach (var role in new[] { Roles.Doctor, Roles.Patient, Roles.Admin })
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }

        if (await userManager.FindByEmailAsync(adminSettings.Email) is null)
        {
            var admin = new AppUser
            {
                UserName = adminSettings.Email,
                Email = adminSettings.Email,
                FirstName = adminSettings.FirstName,
                LastName = adminSettings.LastName,
                EmailConfirmed = true
            };
            var result = await userManager.CreateAsync(admin, adminSettings.Password);
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(admin, Roles.Admin);
            }
            else
            {
                StartupLog.Warn($"Admin seed failed: {string.Join(", ", result.Errors.Select(e => e.Description))}");
            }
        }
    }
}

internal record DevInjectTranscriptRequest(string Transcript);
