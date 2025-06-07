using MessagePack;

namespace VillaManager.Infrastructure.Kafka;

[MessagePackObject]
public class ReservationCanceledEvent
{
    [Key(1)]
    public int ReservationId { get; set; }
    [Key(2)]
    public string PropertyName { get; set; } = null!;
    [Key(3)]
    public string BookedBy { get; set; } = null!;
    [Key(4)]
    public DateTime CanceledAt { get; set; } = DateTime.Now;
    [Key(5)]
    public string OwnerEmail { get; set; } = null!;
    [Key(6)]
    public DateOnly StartDate { get; set; }
    [Key(7)]
    public DateOnly EndDate { get; set; }
}
