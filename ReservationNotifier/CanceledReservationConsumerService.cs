using ReservationNotifier.EmailSender;
using ReservationNotifier.Extensions;
using ReservationNotifier.Kafka;

namespace ReservationNotifier;

public class CanceledReservationConsumerService(
    ILogger<CanceledReservationConsumerService> logger,
    IKafkaConsumer<int, ReservationCanceledEvent> kafkaConsumer,
    IEmailService emailService) : BackgroundService
{
    private readonly ILogger<CanceledReservationConsumerService> _logger = logger;
    private readonly IKafkaConsumer<int, ReservationCanceledEvent> _consumer = kafkaConsumer;
    private readonly IEmailService _emailService = emailService;

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        return Task.Run(() =>
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var canceledReservationEvent = _consumer.ConsumeAsync(stoppingToken);
                    if (canceledReservationEvent is not null)
                    {
                        _emailService.SendEmailAsync(
                            canceledReservationEvent.OwnerEmail,
                            EmailEventExtensions.CanceledReservationSubject,
                            canceledReservationEvent.GetEmailBody());
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError("Ex: Message: {Message}, StackTrace: {StackTrace}", ex.Message, ex.StackTrace);
                }
            }
        }, stoppingToken);
    }
}
