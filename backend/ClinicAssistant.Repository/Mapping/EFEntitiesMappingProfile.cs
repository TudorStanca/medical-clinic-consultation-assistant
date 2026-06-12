using AutoMapper;
using ClinicAssistant.Domain.DTOs;
using ClinicAssistant.Domain.Entities;

namespace ClinicAssistant.Repository.Mapping;

public class EFEntitiesMappingProfile : Profile
{
    public EFEntitiesMappingProfile()
    {
        CreateMap<Doctor, DoctorResponseDTO>()
            .ConstructUsing(d => new DoctorResponseDTO(
                d.Id,
                d.FirstName,
                d.LastName,
                d.Email!,
                d.PhoneNumber,
                d.Specialization,
                d.CodParafa));

        CreateMap<Patient, PatientResponseDTO>()
            .ConstructUsing(p => new PatientResponseDTO(
                p.Id,
                p.FirstName,
                p.LastName,
                p.Email!,
                p.PhoneNumber,
                p.IdentityNumber,
                p.Address,
                p.BirthDate,
                p.Sex));

        CreateMap<ConsultationSession, SessionDetailResponseDTO>()
            .ConstructUsing(s => new SessionDetailResponseDTO(
                s.Id,
                s.Status.ToString(),
                s.Segments.Count,
                s.DoctorId,
                s.PatientId,
                $"{s.Patient.FirstName} {s.Patient.LastName}",
                s.CreatedAt,
                s.PatientTranscriptAccess));

        CreateMap<ConsultationSession, SessionSummaryResponseDTO>()
            .ConstructUsing(s => new SessionSummaryResponseDTO(
                s.Id,
                s.Status.ToString(),
                s.CreatedAt,
                s.DoctorId,
                $"{s.Doctor.FirstName} {s.Doctor.LastName}",
                s.PatientId,
                $"{s.Patient.FirstName} {s.Patient.LastName}",
                s.MedicalLetter != null));

        CreateMap<TranscriptSegment, TranscriptSegmentResponseDTO>()
            .ConstructUsing(t => new TranscriptSegmentResponseDTO(t.StartMs, t.EndMs, t.Text));

        CreateMap<MedicalLetter, MedicalLetterResponseDTO>()
            .ConstructUsing((m, ctx) => new MedicalLetterResponseDTO(
                m.Id,
                m.SessionId,
                m.LetterType,
                m.Location,
                m.WrittenAt,
                m.LastEditedAt,
                m.Antecedente,
                m.Simptome,
                m.Clinice,
                m.Paraclinice,
                m.Diagnostic,
                m.Recomandari,
                ctx.Mapper.Map<DoctorResponseDTO>(m.Session.Doctor),
                ctx.Mapper.Map<PatientResponseDTO>(m.Session.Patient),
                ctx.Mapper.Map<IReadOnlyList<UploadedDocumentResponseDTO>>(m.Documents)));

        CreateMap<MedicalLetter, MedicalLetterSummaryResponseDTO>()
            .ConstructUsing(m => new MedicalLetterSummaryResponseDTO(
                m.Id,
                m.LetterType,
                m.Location,
                m.WrittenAt,
                m.Session.DoctorId,
                $"{m.Session.Doctor.FirstName} {m.Session.Doctor.LastName}"));

        CreateMap<LetterAccessGrant, LetterAccessGrantResponseDTO>()
            .ConstructUsing(g => new LetterAccessGrantResponseDTO(
                g.Id,
                g.GranteeDoctorId,
                $"{g.GranteeDoctor.FirstName} {g.GranteeDoctor.LastName}",
                g.SourceDoctorId,
                $"{g.SourceDoctor.FirstName} {g.SourceDoctor.LastName}",
                g.CreatedAt));

        CreateMap<Doctor, DoctorSearchableResponseDTO>()
            .ConstructUsing(d => new DoctorSearchableResponseDTO(d.Id, d.FirstName, d.LastName, d.Specialization));

        CreateMap<UploadedDocument, UploadedDocumentResponseDTO>()
            .ConstructUsing(d => new UploadedDocumentResponseDTO(
                d.Id,
                d.PatientId,
                d.SessionId,
                d.OriginalFileName,
                d.UploadedAt,
                d.DocumentType.ToString(),
                d.UploadedByUserId));
    }
}
