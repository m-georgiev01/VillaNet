using MessagePack;

namespace ReservationNotifier.Kafka;

[MessagePackObject]
public class ReservationEvent
{
    [Key(1)]
    public int ReservationId { get; set; }
    [Key(2)]
    public string BookedBy { get; set; } = null!;
    [Key(3)]
    public DateOnly StartDate { get; set; }
    [Key(4)]
    public DateOnly EndDate { get; set; }
    [Key(5)]
    public int TotalNights { get; set; }
    [Key(6)]
    public decimal TotalPrice { get; set; }
    [Key(7)]
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    [Key(8)]
    public string OwnerEmail { get; set; } = null!;
}
