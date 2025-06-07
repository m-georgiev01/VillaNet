
using ReservationNotifier.EmailSender;
using ReservationNotifier.Extensions;
using ReservationNotifier.Kafka;

namespace ReservationNotifier;

public class CreatedReservationConsumerService(
    ILogger<CreatedReservationConsumerService> logger,
    IKafkaConsumer<int, ReservationEvent> kafkaConsumer,
    IEmailService emailService) : BackgroundService
{
    private readonly ILogger<CreatedReservationConsumerService> _logger = logger;
    private readonly IKafkaConsumer<int, ReservationEvent> _consumer = kafkaConsumer;
    private readonly IEmailService _emailService = emailService;

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        return Task.Run(() =>
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var reservationEvent = _consumer.ConsumeAsync(stoppingToken);
                    if (reservationEvent is not null)
                    {
                        _emailService.SendEmailAsync(
                            reservationEvent.OwnerEmail,
                            EmailEventExtensions.CreatedReservationSubject,
                            reservationEvent.GetEmailBody());
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
