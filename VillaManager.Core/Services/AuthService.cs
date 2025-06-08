using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using VillaManager.Core.DTOs;
using VillaManager.Core.Exceptions;
using VillaManager.Infrastructure.Configs;
using VillaManager.Infrastructure.Data.Entities;
using VillaManager.Infrastructure.Repository;

namespace VillaManager.Core.Services;

internal class AuthService(
    IRepository<User> userRepository,
    IRepository<Role> roleRepository,
    IOptions<JwtSettings> config) : IAuthService
{
    private readonly IRepository<User> _userRepository = userRepository;
    private readonly IRepository<Role> _roleRepository = roleRepository;
    private readonly IOptions<JwtSettings> _config = config;

    public async Task<AuthResponse> LoginAsync(UserLoginRequest request)
    {
        var user = await _userRepository.GetAllReadOnly()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == request.Email);


        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            throw new InvalidCredentialsException();

        var token = GenerateToken(user, user.Role.Name);

        return new AuthResponse()
        {
            Token = token,
            Email = user.Email,
            Role = user.Role.Name,
            Username = user.Username,
            UserId = user.Id
        };
    }

    public async Task<AuthResponse> RegisterAsync(RegisterUserRequest request)
    {
        if (await _userRepository.GetAllReadOnly().AnyAsync(u => u.Email == request.Email))
            throw new UserAlreadyExistsException(request.Email);

        var role = await _roleRepository.GetByIdAsync(request.RoleId);
        if (role is null)
            throw new RoleNotFoundException(request.RoleId);

        var user = new User
        {
            Email = request.Email,
            Username = request.Username,
            Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
            RoleId = role.Id
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveAsync();

        var token = GenerateToken(user, role.Name);

        return new AuthResponse()
        {
            Token = token,
            Email = user.Email,
            Role = user.Role.Name,
            Username = user.Username,
            UserId = user.Id
        };
    }

    private string GenerateToken(User user, string roleName)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Role, roleName)
        };

        var keyString = _config.Value.Key ?? throw new InvalidOperationException("JWT signing key is missing in configuration");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config.Value.Issuer,
            audience: _config.Value.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(30),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
