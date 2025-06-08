using Moq;
using VillaManager.Core.Services;
using VillaManager.Infrastructure.Data.Entities;
using VillaManager.Infrastructure.Repository;

namespace VillaManager.Core.Tests.Services;

[TestFixture]
public class UserServiceTests
{
    private Mock<IRepository<User>> _userRepo;
    private UserService _userService;

    [SetUp]
    public void SetUp()
    {
        _userRepo = new();
        _userService = new UserService(_userRepo.Object);
    }

    [Test]
    public async Task GetUserEmail_UserExists_ReturnsEmail()
    {
        var expectedEmail = "user@example.com";
        _userRepo
            .Setup(r => r.GetByIdAsync(25))
            .ReturnsAsync(new User { Id = 25, Email = expectedEmail });

        var email = await _userService.GetUserEmail(25);

        Assert.That(email, Is.EqualTo(expectedEmail));
    }

    [Test]
    public void GetUserEmail_UserNotFound_ThrowsNullReferenceException()
    {
        _userRepo
            .Setup(r => r.GetByIdAsync(25))
            .ReturnsAsync((User)null);

        Assert.ThrowsAsync<NullReferenceException>(async () =>
            await _userService.GetUserEmail(25));
    }
}
