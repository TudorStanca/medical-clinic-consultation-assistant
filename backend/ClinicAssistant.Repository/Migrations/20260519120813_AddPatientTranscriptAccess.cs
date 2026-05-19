using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicAssistant.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddPatientTranscriptAccess : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "PatientTranscriptAccess",
                table: "ConsultationSessions",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PatientTranscriptAccess",
                table: "ConsultationSessions");
        }
    }
}
