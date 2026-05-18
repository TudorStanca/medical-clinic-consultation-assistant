using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClinicAssistant.Repository.Migrations
{
    /// <inheritdoc />
    public partial class AddFinishedAtToConsultationSession : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "FinishedAt",
                table: "ConsultationSessions",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FinishedAt",
                table: "ConsultationSessions");
        }
    }
}
