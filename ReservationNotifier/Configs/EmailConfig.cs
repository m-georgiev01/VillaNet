namespace ReservationNotifier.Configs;

public class EmailConfig
{
    public string SmtpHost { get; set; } = null!;
    public int SmtpPort { get; set; }
    public string SmtpUser { get; set; } = null!;
    public string SmtpPass { get; set; } = null!;
    public string FromName { get; set; } = null!;
    public string FromAddress { get; set; } = null!;
}
