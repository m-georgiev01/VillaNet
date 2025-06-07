using Microsoft.Extensions.DependencyInjection;
using VillaManager.Core.Services;

namespace VillaManager.Core;

public static class DependencyInjection
{
    public static IServiceCollection AddCore(this IServiceCollection services)
    {
        return services
            .AddServices();
    }

    private static IServiceCollection AddServices(this IServiceCollection services)
    {
        return services
            .AddScoped<IAuthService, AuthService>()
            .AddScoped<IPropertyService, PropertyService>()
            .AddScoped<IReservationService, ReservationService>()
            .AddScoped<IUserService, UserService>()
            .AddScoped<IImageService, ImageService>();
    }
}
