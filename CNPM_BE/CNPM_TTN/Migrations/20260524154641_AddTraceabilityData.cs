using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CNPM_TTN.Migrations
{
    /// <inheritdoc />
    public partial class AddTraceabilityData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TraceabilityData",
                table: "RoastingBatches",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TraceabilityData",
                table: "ProductDetails",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TraceabilityData",
                table: "RoastingBatches");

            migrationBuilder.DropColumn(
                name: "TraceabilityData",
                table: "ProductDetails");
        }
    }
}
