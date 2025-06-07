using Microsoft.Extensions.Options;
using ReservationNotifier.Configs;
using ReservationNotifier.EmailSender;
using ReservationNotifier.Kafka;

namespace ReservationNotifier;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = Host.CreateApplicationBuilder(args);

        builder.Services
            .Configure<KafkaConfig>(builder.Configuration.GetSection(nameof(KafkaConfig)))
            .Configure<EmailConfig>(builder.Configuration.GetSection(nameof(EmailConfig)));

        builder.Services
            .AddSingleton<IKafkaConsumer<int, ReservationEvent>, KafkaConsumer<int, ReservationEvent>>(sp =>
            {
                var config = sp.GetRequiredService<IOptions<KafkaConfig>>();
                var logger = sp.GetRequiredService<ILogger<KafkaConsumer<int, ReservationEvent>>>();
                return new KafkaConsumer<int, ReservationEvent>(config.Value.CreatedReservationsTopic, logger, config);
            })
            .AddSingleton<IKafkaConsumer<int, ReservationCanceledEvent>, KafkaConsumer<int, ReservationCanceledEvent>>(sp =>
            {
                var config = sp.GetRequiredService<IOptions<KafkaConfig>>();
                var logger = sp.GetRequiredService<ILogger<KafkaConsumer<int, ReservationCanceledEvent>>>();
                return new KafkaConsumer<int, ReservationCanceledEvent>(config.Value.CancelledReservationsTopic, logger, config);
            })
            .AddTransient<IEmailService, EmailService>();

        builder.Services.AddHostedService<CreatedReservationConsumerService>();
        builder.Services.AddHostedService<CanceledReservationConsumerService>();

        var host = builder.Build();
        host.Run();
    }
}