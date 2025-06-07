
using Confluent.Kafka;
using Microsoft.Extensions.Options;
using ReservationNotifier.Configs;
using ReservationNotifier.Deserializers;

namespace ReservationNotifier.Kafka;

public class KafkaConsumer<TKey, TValue> : IKafkaConsumer<TKey, TValue>
{
    private readonly ILogger<KafkaConsumer<TKey, TValue>> _logger;
    private readonly IConsumer<TKey, TValue> _consumer;
    private readonly IOptions<KafkaConfig> _kafkaConfig;
    private readonly string _topicName;

    public KafkaConsumer(
        string topicName,
        ILogger<KafkaConsumer<TKey, TValue>> logger,
        IOptions<KafkaConfig> kafkaConfig)
    {
        _logger = logger;
        _kafkaConfig = kafkaConfig;
        _topicName = topicName;

        var config = new ConsumerConfig()
        {
            BootstrapServers = _kafkaConfig.Value.BootstrapServers,
            GroupId = _kafkaConfig.Value.GroupId,
            AutoOffsetReset = AutoOffsetReset.Earliest,
        };

        _consumer = new ConsumerBuilder<TKey, TValue>(config)
            .SetKeyDeserializer(new MsgPackKafkaDeserializer<TKey>())
            .SetValueDeserializer(new MsgPackKafkaDeserializer<TValue>())
            .Build();

        _consumer.Subscribe(topicName);
    }

    public TValue? ConsumeAsync(CancellationToken cancellationToken)
    {
        try
        {
            var msg = _consumer.Consume(cancellationToken);

            if (msg is null || msg.Message is null || msg.Message.Value is null) return default;

            return msg.Message.Value;
        }
        catch (OperationCanceledException ex)
        {
            _logger.LogError("Consumer for topic {Topic} stopped!", _topicName);
            return default;
        }
        catch (Exception ex)
        {
            _logger.LogError("Consumer Error: Messge - {Message}, StackTrace: {StackTrace}", ex.Message, ex.StackTrace);
            return default;
        }
    }

    public void Dispose()
    {
        _consumer.Close();
    }
}
