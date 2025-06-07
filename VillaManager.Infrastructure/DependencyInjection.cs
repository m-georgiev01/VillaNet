using Microsoft.Extensions.DependencyInjection;
using VillaManager.Infrastructure.Data.Entities;
using VillaManager.Infrastructure.Kafka;
using VillaManager.Infrastructure.Repository;

namespace VillaManager.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        return services
            .AddRepositories()
            .AddKafkaProducer();
    }

    private static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        return services
            .AddScoped<IRepository<User>, Repository<User>>()
            .AddScoped<IRepository<Role>, Repository<Role>>()
            .AddScoped<IRepository<Property>, Repository<Property>>()
            .AddScoped<IRepository<Reservation>, Repository<Reservation>>();
    }

    private static IServiceCollection AddKafkaProducer(this IServiceCollection services) {
        return services
            .AddSingleton<IKafkaProducer<int, ReservationEvent>, KafkaProducer<int, ReservationEvent>>()
            .AddSingleton<IKafkaProducer<int, ReservationCanceledEvent>, KafkaProducer<int, ReservationCanceledEvent>>();
    }
}
