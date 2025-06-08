using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VillaManager.Infrastructure.Migrations;

/// <inheritdoc />
public partial class ExtendPropertyEntity : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<int>(
            name: "Capacity",
            table: "Properties",
            type: "integer",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.AddColumn<string>(
            name: "Image",
            table: "Properties",
            type: "text",
            nullable: false,
            defaultValue: "");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "Capacity",
            table: "Properties");

        migrationBuilder.DropColumn(
            name: "Image",
            table: "Properties");
    }
}
