using Confluent.Kafka;
using MessagePack;

namespace VillaManager.Infrastructure.Serializers;
public class MessagePackKafkaSerializer<T> : ISerializer<T>
{
    public byte[] Serialize(T data, SerializationContext context)
    {
        return MessagePackSerializer.Serialize(data);
    }
}
