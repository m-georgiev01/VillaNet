namespace VillaManager.Core.DTOs;

public class PropertyDTO
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Location { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal PricePerNight { get; set; }
    public int Capacity { get; set; }
    public string Image { get; set; } = null!;
    public int OwnerId { get; set; }
}
