using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicAssistant.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddMedicalLetterDocsAndSessionStatusString : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "MedicalLetterId",
                table: "UploadedDocuments",
                type: "uuid",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "ConsultationSessions",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.CreateIndex(
                name: "IX_UploadedDocuments_MedicalLetterId",
                table: "UploadedDocuments",
                column: "MedicalLetterId");

            migrationBuilder.AddForeignKey(
                name: "FK_UploadedDocuments_MedicalLetters_MedicalLetterId",
                table: "UploadedDocuments",
                column: "MedicalLetterId",
                principalTable: "MedicalLetters",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UploadedDocuments_MedicalLetters_MedicalLetterId",
                table: "UploadedDocuments");

            migrationBuilder.DropIndex(
                name: "IX_UploadedDocuments_MedicalLetterId",
                table: "UploadedDocuments");

            migrationBuilder.DropColumn(
                name: "MedicalLetterId",
                table: "UploadedDocuments");

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "ConsultationSessions",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");
        }
    }
}
