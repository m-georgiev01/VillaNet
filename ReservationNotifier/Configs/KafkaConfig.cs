namespace ReservationNotifier.Configs;

public class KafkaConfig
{
    public string BootstrapServers { get; set; } = null!;
    public string CreatedReservationsTopic { get; set; } = null!;
    public string CancelledReservationsTopic { get; set; } = null!;
    public string GroupId { get; set; } = null!;
}
