
using MailKit.Net.Smtp;
using Microsoft.Extensions.Options;
using MimeKit;
using ReservationNotifier.Configs;

namespace ReservationNotifier.EmailSender;

public class EmailService(IOptions<EmailConfig> emailConfig) : IEmailService
{
    private readonly IOptions<EmailConfig> _emailConfig = emailConfig;

    public async Task SendEmailAsync(string to, string subject, string htmlBody)
    {
        var msg = BuildMessage(to, subject, htmlBody);

        using var client = new SmtpClient();
        await client.ConnectAsync(_emailConfig.Value.SmtpHost, _emailConfig.Value.SmtpPort, MailKit.Security.SecureSocketOptions.Auto);
        await client.AuthenticateAsync(_emailConfig.Value.SmtpUser, _emailConfig.Value.SmtpPass);
        await client.SendAsync(msg);
        await client.DisconnectAsync(true);
    }

    private MimeMessage BuildMessage(string to, string subject, string htmlBody)
    {
        var msg = new MimeMessage();
        msg.From.Add(new MailboxAddress(_emailConfig.Value.FromName, _emailConfig.Value.FromAddress));
        msg.To.Add(MailboxAddress.Parse(to));
        msg.Subject = subject;

        var body = new BodyBuilder { HtmlBody = htmlBody };
        msg.Body = body.ToMessageBody();
        return msg;
    }
}
