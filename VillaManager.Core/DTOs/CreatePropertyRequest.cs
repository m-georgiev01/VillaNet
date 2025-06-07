using Microsoft.AspNetCore.Http;

namespace VillaManager.Core.DTOs;

public class CreatePropertyRequest
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal PricePerNight { get; set; }
    public string Location { get; set; } = null!;
    public int Capacity { get; set; }
    public IFormFile Image { get; set; } = null!;
}
