using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace VillaManager.Infrastructure.Data.Entities;
public class Property
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal PricePerNight { get; set; }
    public string Location { get; set; } = null!;
    public int OwnerId { get; set; }

    public User Owner { get; set; } = null!;

    public int Capacity { get; set; }
    public string Image { get; set; } = string.Empty;
}
