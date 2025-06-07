namespace ReservationNotifier.EmailSender;

public interface IEmailService
{
    Task SendEmailAsync (string to, string subject, string htmlBody);
}
