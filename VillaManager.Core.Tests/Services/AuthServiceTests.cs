using Microsoft.Extensions.Options;
using MockQueryable;
using Moq;
using System.IdentityModel.Tokens.Jwt;
using VillaManager.Core.DTOs;
using VillaManager.Core.Exceptions;
using VillaManager.Core.Services;
using VillaManager.Infrastructure.Configs;
using VillaManager.Infrastructure.Data.Entities;
using VillaManager.Infrastructure.Repository;

namespace VillaManager.Core.Tests.Services;

[TestFixture]
public class AuthServiceTests
{
    private Mock<IRepository<User>> _userRepository;
    private Mock<IRepository<Role>> _roleRepository;
    private Mock<IOptions<JwtSettings>> _jwtOptions;
    private AuthService _authService;
    private JwtSettings _jwtSettings;

    [SetUp]
    public void SetUp()
    {
        _userRepository = new();
        _roleRepository = new();
        _jwtOptions = new();

        _jwtSettings = new JwtSettings
        {
            Key = "ThisIsAVeryLongSecretKeyForJwtTokenGeneration123456789",
            Issuer = "TestIssuer",
            Audience = "TestAudience"
        };

        _jwtOptions.Setup(x => x.Value).Returns(_jwtSettings);

        _authService = new AuthService(_userRepository.Object, _roleRepository.Object, _jwtOptions.Object);
    }

    [Test]
    public async Task LoginAsync_ValidCredentials_ReturnsAuthResponse()
    {
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword("password123");
        var role = new Role { Id = 1, Name = "User" };
        var user = new User
        {
            Id = 1,
            Email = "test@example.com",
            Username = "testuser",
            Password = hashedPassword,
            RoleId = 1,
            Role = role
        };

        var users = new List<User> { user };
        _userRepository.Setup(r => r.GetAllReadOnly())
            .Returns(users.AsQueryable().BuildMock());

        var request = new UserLoginRequest
        {
            Email = "test@example.com",
            Password = "password123"
        };

        var result = await _authService.LoginAsync(request);

        Assert.Multiple(() =>
        {
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Email, Is.EqualTo(user.Email));
            Assert.That(result.Username, Is.EqualTo(user.Username));
            Assert.That(result.Role, Is.EqualTo(role.Name));
            Assert.That(result.UserId, Is.EqualTo(user.Id));
            Assert.That(result.Token, Is.Not.Null.And.Not.Empty);
        });

        var tokenHandler = new JwtSecurityTokenHandler();
        Assert.That(tokenHandler.CanReadToken(result.Token), Is.True);
    }

    [Test]
    public async Task LoginAsync_UserNotFound_ThrowsInvalidCredentialsException()
    {
        var users = new List<User>();
        _userRepository.Setup(r => r.GetAllReadOnly())
            .Returns(users.AsQueryable().BuildMock());

        var request = new UserLoginRequest
        {
            Email = "nonexistent@example.com",
            Password = "password123"
        };

        Assert.ThrowsAsync<InvalidCredentialsException>(
            () => _authService.LoginAsync(request));
    }

    [Test]
    public async Task LoginAsync_InvalidPassword_ThrowsInvalidCredentialsException()
    {
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword("correctpassword");
        var role = new Role { Id = 1, Name = "User" };
        var user = new User
        {
            Id = 1,
            Email = "test@example.com",
            Username = "testuser",
            Password = hashedPassword,
            RoleId = 1,
            Role = role
        };

        var users = new List<User> { user };
        _userRepository.Setup(r => r.GetAllReadOnly())
            .Returns(users.AsQueryable().BuildMock());

        var request = new UserLoginRequest
        {
            Email = "test@example.com",
            Password = "wrongpassword"
        };

        Assert.ThrowsAsync<InvalidCredentialsException>(
            () => _authService.LoginAsync(request));
    }

    [Test]
    public async Task RegisterAsync_ValidRequest_ReturnsAuthResponse()
    {
        var role = new Role { Id = 1, Name = "User" };
        var users = new List<User>();
        User savedUser = null;

        _userRepository.Setup(r => r.GetAllReadOnly())
            .Returns(users.AsQueryable().BuildMock());

        _roleRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(role);

        _userRepository.Setup(r => r.AddAsync(It.IsAny<User>()))
            .Callback<User>(u => { u.Id = 99; savedUser = u; u.Role = role; })
            .Returns(Task.CompletedTask);

        _userRepository.Setup(r => r.SaveAsync())
            .Returns(Task.CompletedTask);

        var request = new RegisterUserRequest
        {
            Email = "newuser@example.com",
            Username = "newuser",
            Password = "password123",
            RoleId = 1
        };

        var result = await _authService.RegisterAsync(request);

        Assert.Multiple(() =>
        {
            Assert.That(result, Is.Not.Null);
            Assert.That(result.Email, Is.EqualTo(request.Email));
            Assert.That(result.Username, Is.EqualTo(request.Username));
            Assert.That(result.Role, Is.EqualTo(role.Name));
            Assert.That(result.UserId, Is.EqualTo(99));
            Assert.That(result.Token, Is.Not.Null.And.Not.Empty);
            Assert.That(savedUser, Is.Not.Null);
            Assert.That(BCrypt.Net.BCrypt.Verify(request.Password, savedUser.Password), Is.True);
        });

        _userRepository.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Once);
        _userRepository.Verify(r => r.SaveAsync(), Times.Once);
    }

    [Test]
    public async Task RegisterAsync_UserAlreadyExists_ThrowsUserAlreadyExistsException()
    {
        var existingUser = new User
        {
            Id = 1,
            Email = "existing@example.com",
            Username = "existing"
        };

        var users = new List<User> { existingUser };
        _userRepository.Setup(r => r.GetAllReadOnly())
            .Returns(users.AsQueryable().BuildMock());

        var request = new RegisterUserRequest
        {
            Email = "existing@example.com",
            Username = "newuser",
            Password = "password123",
            RoleId = 1
        };

        Assert.ThrowsAsync<UserAlreadyExistsException>(
            () => _authService.RegisterAsync(request));
    }

    [Test]
    public async Task RegisterAsync_RoleNotFound_ThrowsRoleNotFoundException()
    {
        var users = new List<User>();
        _userRepository.Setup(r => r.GetAllReadOnly())
            .Returns(users.AsQueryable().BuildMock());

        _roleRepository.Setup(r => r.GetByIdAsync(999))
            .ReturnsAsync((Role)null);

        var request = new RegisterUserRequest
        {
            Email = "newuser@example.com",
            Username = "newuser",
            Password = "password123",
            RoleId = 999
        };

        Assert.ThrowsAsync<RoleNotFoundException>(
            () => _authService.RegisterAsync(request));
    }
}

