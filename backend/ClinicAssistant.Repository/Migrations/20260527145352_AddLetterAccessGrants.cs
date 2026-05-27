using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicAssistant.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddLetterAccessGrants : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LetterAccessGrants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PatientId = table.Column<string>(type: "text", nullable: false),
                    GranteeDoctorId = table.Column<string>(type: "text", nullable: false),
                    SourceDoctorId = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LetterAccessGrants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LetterAccessGrants_Doctors_GranteeDoctorId",
                        column: x => x.GranteeDoctorId,
                        principalTable: "Doctors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LetterAccessGrants_Doctors_SourceDoctorId",
                        column: x => x.SourceDoctorId,
                        principalTable: "Doctors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LetterAccessGrants_Patients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "Patients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LetterAccessGrants_GranteeDoctorId",
                table: "LetterAccessGrants",
                column: "GranteeDoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_LetterAccessGrants_PatientId_GranteeDoctorId_SourceDoctorId",
                table: "LetterAccessGrants",
                columns: new[] { "PatientId", "GranteeDoctorId", "SourceDoctorId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LetterAccessGrants_SourceDoctorId",
                table: "LetterAccessGrants",
                column: "SourceDoctorId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LetterAccessGrants");
        }
    }
}
