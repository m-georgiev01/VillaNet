namespace VillaManager.Core.DTOs;

public class UpdatePropertyRequest
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal PricePerNight { get; set; }
}
