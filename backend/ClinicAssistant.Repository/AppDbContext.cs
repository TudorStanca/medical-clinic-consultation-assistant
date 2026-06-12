using ClinicAssistant.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ClinicAssistant.Repository;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<AppUser>(options)
{
    public DbSet<Doctor> Doctors { get; set; }
    public DbSet<Patient> Patients { get; set; }
    public DbSet<ConsultationSession> ConsultationSessions { get; set; }
    public DbSet<TranscriptSegment> TranscriptSegments { get; set; }
    public DbSet<MedicalLetter> MedicalLetters { get; set; }
    public DbSet<UploadedDocument> UploadedDocuments { get; set; }
    public DbSet<LetterAttachment> LetterAttachments { get; set; }
    public DbSet<LetterAccessGrant> LetterAccessGrants { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // TPT: Doctor and Patient as separate tables
        builder.Entity<Doctor>().ToTable("Doctors");
        builder.Entity<Patient>().ToTable("Patients");

        // Unique index on Patient.IdentityNumber
        builder.Entity<Patient>()
            .HasIndex(p => p.IdentityNumber).IsUnique();

        // ConsultationSession → Doctor / Patient (Restrict on delete)
        builder.Entity<ConsultationSession>()
            .HasOne(s => s.Doctor).WithMany()
            .HasForeignKey(s => s.DoctorId).OnDelete(DeleteBehavior.Restrict);

        builder.Entity<ConsultationSession>()
            .HasOne(s => s.Patient).WithMany()
            .HasForeignKey(s => s.PatientId).OnDelete(DeleteBehavior.Restrict);

        // Segments — backing field
        builder.Entity<ConsultationSession>()
            .HasMany(s => s.Segments).WithOne(seg => seg.Session)
            .HasForeignKey(seg => seg.SessionId).OnDelete(DeleteBehavior.Cascade);

        builder.Entity<ConsultationSession>()
            .Navigation(s => s.Segments).UsePropertyAccessMode(PropertyAccessMode.Field);

        // MedicalLetter — 1-to-1
        builder.Entity<ConsultationSession>()
            .HasOne(s => s.MedicalLetter).WithOne(l => l.Session)
            .HasForeignKey<MedicalLetter>(l => l.SessionId).OnDelete(DeleteBehavior.Cascade);

        // UploadedDocument → Patient (Cascade)
        builder.Entity<UploadedDocument>()
            .HasOne(d => d.Patient).WithMany()
            .HasForeignKey(d => d.PatientId).OnDelete(DeleteBehavior.Cascade);

        // UploadedDocument → Session (nullable, SetNull)
        builder.Entity<UploadedDocument>()
            .HasOne(d => d.Session).WithMany()
            .HasForeignKey(d => d.SessionId)
            .OnDelete(DeleteBehavior.SetNull).IsRequired(false);

        // MedicalLetter → UploadedDocuments (one-to-many, nullable FK)
        builder.Entity<MedicalLetter>()
            .HasMany(l => l.Documents).WithOne(d => d.MedicalLetter)
            .HasForeignKey(d => d.MedicalLetterId)
            .OnDelete(DeleteBehavior.SetNull).IsRequired(false);

        builder.Entity<MedicalLetter>()
            .Navigation(l => l.Documents).UsePropertyAccessMode(PropertyAccessMode.Field);

        // LetterAttachment → MedicalLetter (Cascade)
        builder.Entity<LetterAttachment>()
            .HasOne(a => a.MedicalLetter).WithMany(l => l.Attachments)
            .HasForeignKey(a => a.MedicalLetterId).OnDelete(DeleteBehavior.Cascade);

        builder.Entity<MedicalLetter>()
            .Navigation(l => l.Attachments).UsePropertyAccessMode(PropertyAccessMode.Field);

        // LetterAccessGrant → Patient / GranteeDoctor / SourceDoctor (Restrict on delete)
        builder.Entity<LetterAccessGrant>()
            .HasOne(g => g.Patient).WithMany()
            .HasForeignKey(g => g.PatientId).OnDelete(DeleteBehavior.Restrict);

        builder.Entity<LetterAccessGrant>()
            .HasOne(g => g.GranteeDoctor).WithMany()
            .HasForeignKey(g => g.GranteeDoctorId).OnDelete(DeleteBehavior.Restrict);

        builder.Entity<LetterAccessGrant>()
            .HasOne(g => g.SourceDoctor).WithMany()
            .HasForeignKey(g => g.SourceDoctorId).OnDelete(DeleteBehavior.Restrict);

        builder.Entity<LetterAccessGrant>()
            .HasIndex(g => new { g.PatientId, g.GranteeDoctorId, g.SourceDoctorId }).IsUnique();

        // Sex enum → string in DB
        builder.Entity<Patient>()
            .Property(p => p.Sex).HasConversion<string>();

        // DocumentType enum → string in DB
        builder.Entity<UploadedDocument>()
            .Property(d => d.DocumentType).HasConversion<string>();

        // SessionStatus enum → string in DB
        builder.Entity<ConsultationSession>()
            .Property(s => s.Status).HasConversion<string>();
    }
}
