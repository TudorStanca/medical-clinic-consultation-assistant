# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Medical clinic consultation assistant — a web system that records audio during doctor-patient consultations, transcribes it in real time (Whisper), and uses an LLM to generate clinical documents (e.g. medical letters). Three planned phases: Scheduling, Consultation, Post-Consultation. **Current focus: Consultation phase only.**

Primary flow: Doctor presses Start → microphone captures audio → chunks sent to backend → Whisper transcribes → transcript streamed via SignalR to frontend → LLM generates draft medical letter → doctor reviews/edits → PDF export.

## Tech Stack

- **Backend:** C# ASP.NET Core, .NET 9, PostgreSQL (EF Core, code-first), Log4Net, Swagger
- **Frontend:** React + TypeScript (Vite), Material UI
- **Real-time:** SignalR
- **STT:** Whisper.net (local, wraps whisper.cpp) — Romanian language, medical terminology
- **LLM:** Claude API or OpenAI API (for medical letter generation)
- **Audio storage:** local filesystem (temp chunks, deleted after transcription) — no external bucket needed for now

## Commands

### Backend
```bash
# Run backend (from backend/ClinicAssistant/)
dotnet run

# Build solution
dotnet build backend/ClinicAssistant/ClinicAssistant.sln

# Run tests (when added)
dotnet test
```

### Frontend
```bash
# From frontend/clinic-assistant-web/
npm install
npm run dev
npm run build
```

## Backend Architecture

### Project Structure
```
backend/
  ClinicAssistant/              # Entry point: Program.cs, Controllers/, Middleware/, WebSockets/, AudioTranscribers/
  ClinicalAssistant.Domain/     # Entities, Enums, Exceptions, Interfaces (all interfaces live here)
  ClinicalAssistant.Repository/ # EF/in-memory repositories implementing domain interfaces
  ClinicalAssistant.Service/    # Business logic implementing domain interfaces
```

> Note: folder names use `ClinicalAssistant.*` but namespaces in code use `ClinicAssistant.*` — keep this consistent when adding files.

### Interface Placement (deviation from reference project)
All interfaces (`ITranscriptionService`, `ITranscriptionRepository`, `IAudioTranscriber`, `ITranscriptPublisher`) live in `ClinicalAssistant.Domain/Interfaces/`. This differs from THESIS_CONTEXT.md (which puts service interfaces in Controller layer and repo interfaces in Service layer) — **keep interfaces in Domain** for this project.

### Key Abstractions
- `IAudioTranscriber` — pluggable STT backend. Currently: `StubAudioTranscriber`. Replace with `WhisperAudioTranscriber` for M1.
- `ITranscriptPublisher` — sends segments/status over SignalR (`SignalRTranscriptPublisher`)
- `ITranscriptionRepository` — session storage. Currently: `InMemoryTranscriptionRepository`. Replace with EF/PostgreSQL when DB is added.
- `ITranscriptionService` — orchestrates chunk processing: save path → call transcriber → add segments → publish via SignalR

### SignalR Events (frontend must handle)
- `TranscriptSegment` — `{ startMs, endMs, text }` — pushed per transcribed chunk
- `SessionStatus` — `{ sessionId, status }` — pushed on status changes

### Audio Chunk Flow
1. Frontend records via `MediaRecorder` (WebM/Opus), sends blob every ~5s
2. `POST /api/Transcription/{sessionId}/chunks` saves file to `App_Data/audio/{sessionId}/`
3. `TranscriptionService.ProcessChunkAsync` calls `IAudioTranscriber.TranscribeChunkAsync`
4. Segments published via SignalR; chunk files deleted after transcription (audio folder wiped on startup)

### Audio Format
MediaRecorder outputs **WebM/Opus**; Whisper.net expects **WAV**. Conversion needed (NAudio or FFmpeg wrapper).

### Conventions
- Primary constructor syntax: `public XService(IDep dep) { _dep = dep; }`
- Log4Net: `private readonly ILog _logger = LogManager.GetLogger(typeof(X));`
- Custom exceptions: throw `NotFoundException` (404) in service; `GlobalExceptionMiddleware` converts to HTTP response
- All services/repos currently registered as `Singleton` (will switch to `Scoped` when EF Core is added)
- No DTOs yet — controllers return anonymous objects. Add typed `XResponseDTO` as features grow.
- No FluentValidation or AutoMapper yet — add when entities multiply.
- **No alignment spaces** — never pad tokens with extra spaces to align columns. One space between each token, always:
  ```csharp
  // WRONG
  private readonly ILog                        _logger      = ...;
  private readonly IUploadedDocumentRepository _documentRepo = ...;
  // CORRECT
  private readonly ILog _logger = ...;
  private readonly IUploadedDocumentRepository _documentRepo = ...;
  ```
  Same rule applies to record parameters, field declarations, and assignments.

## Frontend Architecture

Frontend is currently default Vite+React boilerplate. Follow feature-folder structure when building:

```
src/
  core/         # axios instance (useApiClient), SignalR setup
  auth/         # auth context, JWT handling
  consultation/ # feature folder: pages/, components/, props.ts, useTranscriptionApi.ts
```

### API Layer Pattern
- One `useXApi.ts` hook per feature wrapping all API calls
- `useApiClient()` provides the axios instance with auth interceptor
- URL constants at top of hook: `const transcriptionUrl = "/api/Transcription"`
- All SignalR connection logic in a dedicated hook (e.g. `useTranscriptionHub.ts`)

## Naming Conventions

| Concept | Convention | Example |
|---|---|---|
| C# classes | PascalCase | `TranscriptionService`, `PatientRepository` |
| C# interfaces | `I` prefix | `ITranscriptionService`, `IPatientRepository` |
| C# private fields | `_camelCase` | `_transcriptionService`, `_logger` |
| C# async methods | `Async` suffix | `GetByIdAsync`, `ProcessChunkAsync` |
| DTOs | `EntityVerbDTO` | `PatientPostDTO`, `AppointmentResponseDTO` |
| EF Entities | plain PascalCase | `Patient`, `Doctor`, `Appointment` |
| Controllers | `EntityController` | `TranscriptionController`, `PatientController` |
| Services | `EntityService` | `TranscriptionService`, `PatientService` |
| Repositories | `EntityRepository` | `PatientRepository` |
| Validators | `EntityDTOValidator` | `PatientPostDTOValidator` |
| TS interfaces | PascalCase | `TranscriptSegment`, `SessionResponseDTO` |
| TS hooks | `use` prefix | `useTranscriptionApi`, `useApiClient` |
| TS page components | `EntityPage.tsx` | `ConsultationPage.tsx` |
| API URL constants | top of hook | `const transcriptionUrl = "/api/Transcription"` |

## Layer Patterns

### Controller
- Inherit `ControllerBase`, decorated with `[ApiController]`, `[Route("api/[controller]")]`
- Annotate every action with `[ProducesResponseType]`
- Depends only on service interfaces, never repositories
- Primary constructor syntax: `public XController(IXService service) : ControllerBase`

### Service
- Implements interface defined in `Domain/Interfaces/`
- Validate input with FluentValidation before any DB operation (when added)
- Throw custom exceptions — never return null for "not found": `throw new NotFoundException(...)`
- Use AutoMapper for DTO↔entity conversions (when added)
- Log at entry point of every significant method

### Repository
- Implements interface defined in `Domain/Interfaces/`
- Only layer that touches `DbContext`
- Method naming: `GetByIdAsync`, `GetAllAsync`, `AddAsync`, `UpdateAsync`, `DeleteAsync`

### Domain
- DTOs: `XPostDTO` (create input), `XPutDTO` (update input), `XResponseDTO` (output)
- Custom exceptions: `CustomException` (base, has `StatusCode`) → `NotFoundException` (404) → add `EntityValidationException` (422) when needed
- Enums in `Domain/Enums/`, PascalCase values

### FluentValidation (when adding)
- One validator per DTO: `XPostDTOValidator`
- Register via `AddValidatorsFromAssemblyContaining<XValidator>()`
- Access via `IValidatorFactory` in services — avoid direct DI of validators

### AutoMapper (when adding)
- Two profiles: `EFEntitiesMappingProfile` (Repository layer), `AutoMapperServiceProfile` (Service layer)
- Register in `Program.cs`: `AddAutoMapper(cfg => { cfg.AddProfile<...>(); })`

### DI Registration (Program.cs)
- Repositories: `AddScoped<IXRepository, XRepository>()`
- Services: `AddScoped<IXService, XService>()`
- Singletons only for truly stateless utilities

## Frontend Patterns

### Feature Folder Structure
```
<feature>/
  pages/          # XPage.tsx
  components/     # sub-components
  props.ts        # TypeScript interfaces for this feature
  useXApi.ts      # all API calls for this feature
```

### API Hook Pattern
```typescript
const useTranscriptionApi = () => {
  const { axios } = useApiClient();
  const transcriptionUrl = "/api/Transcription";

  const createSession = useCallback(async () => {
    const response = await axios.post<SessionResponseDTO>(transcriptionUrl);
    return response.data;
  }, [axios]);

  return { createSession };
};
```

### Core API Client (`useApiClient`)
- Single axios instance via `useMemo`
- Request interceptor: attaches `Authorization: Bearer <token>`
- Response interceptor: handles 401/404 globally
- Components never handle tokens directly

## Known Gaps / Planned Work
- **M1 (current):** Replace stub with real Whisper.net transcription; build recording UI with Start/Pause/Stop; display live transcript
- **Later:** PostgreSQL + EF Core, auth (JWT, Doctor role), LLM integration for medical letter draft, PDF export, Scheduling and Post-Consultation phases

## Architecture Notes
- **Streaming alternative:** Current chunk approach has ~5-10s latency. Raw WebSocket audio streaming is a known alternative if latency becomes unacceptable — not implemented yet.
- **Security:** To be addressed after core consultation flow works. Keep in mind: audio data sensitivity, role-based access (Doctor/Patient), audit trails.
