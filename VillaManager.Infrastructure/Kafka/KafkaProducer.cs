using Confluent.Kafka;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using VillaManager.Infrastructure.Configs;
using VillaManager.Infrastructure.Serializers;

namespace VillaManager.Infrastructure.Kafka;

internal class KafkaProducer<TKey, TValue> : IKafkaProducer<TKey, TValue>
{
    private readonly ILogger<KafkaProducer<TKey, TValue>> _logger;
    private readonly IOptions<KafkaConfig> _kafkaConfig;
    private readonly IProducer<TKey, TValue> _producer;

    public KafkaProducer(IOptions<KafkaConfig> kafkaConfig, ILogger<KafkaProducer<TKey, TValue>> logger)
    {
        _logger = logger;
        _kafkaConfig = kafkaConfig;

        var config = new ProducerConfig { BootstrapServers = _kafkaConfig.Value.BootstrapServers };

        _producer = new ProducerBuilder<TKey, TValue>(config)
            .SetKeySerializer(new MessagePackKafkaSerializer<TKey>())
            .SetValueSerializer(new MessagePackKafkaSerializer<TValue>())
            .Build();
    }

    public async Task SendAsync(string topicName, TKey key, TValue value)
    {
        try
        {
            await _producer.ProduceAsync(topicName, new Message<TKey, TValue> { Key = key, Value = value });
        }
        catch (ProduceException<string, string> ex)
        {
            _logger.LogError("Kafka produce error: {Reason}", ex.Error.Reason);
        }
    }

    public void Dispose()
    {
        _producer.Dispose();
    }
}
