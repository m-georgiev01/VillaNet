using VillaManager.Core.DTOs;

namespace VillaManager.Core.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterUserRequest request);
    Task<AuthResponse> LoginAsync(UserLoginRequest request);
}
