using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VillaManager.Infrastructure.Migrations;

/// <inheritdoc />
public partial class ChangeDatesToDateOnly : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<DateOnly>(
            name: "StartDate",
            table: "Reservations",
            type: "date",
            nullable: false,
            oldClrType: typeof(DateTime),
            oldType: "timestamp with time zone");

        migrationBuilder.AlterColumn<DateOnly>(
            name: "EndDate",
            table: "Reservations",
            type: "date",
            nullable: false,
            oldClrType: typeof(DateTime),
            oldType: "timestamp with time zone");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<DateTime>(
            name: "StartDate",
            table: "Reservations",
            type: "timestamp with time zone",
            nullable: false,
            oldClrType: typeof(DateOnly),
            oldType: "date");

        migrationBuilder.AlterColumn<DateTime>(
            name: "EndDate",
            table: "Reservations",
            type: "timestamp with time zone",
            nullable: false,
            oldClrType: typeof(DateOnly),
            oldType: "date");
    }
}
