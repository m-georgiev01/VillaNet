namespace ReservationNotifier.Kafka;
public interface IKafkaConsumer<TKey, TValue> : IDisposable
{
    TValue? ConsumeAsync(CancellationToken cancellationToken);
}
