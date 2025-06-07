using Confluent.Kafka;
using MessagePack;

namespace ReservationNotifier.Deserializers;
public class MsgPackKafkaDeserializer<T> : IDeserializer<T>
{
    public T Deserialize(ReadOnlySpan<byte> data, bool isNull, SerializationContext context)
    {
        return data == null || data.Length == 0 ? default : MessagePackSerializer.Deserialize<T>(data.ToArray());
    }
}
