namespace VillaManager.Infrastructure.Kafka;
public interface IKafkaProducer<TKey, TValue> : IDisposable
{
    Task SendAsync(string topicName, TKey key, TValue value);
}
