using VillaManager.Infrastructure.Data.Entities;
using VillaManager.Infrastructure.Repository;

namespace VillaManager.Core.Services;
internal class UserService(IRepository<User> userRepo) : IUserService
{
    private readonly IRepository<User> _userRepo = userRepo;

    public async Task<string> GetUserEmail(int userId)
    {
        return (await _userRepo
            .GetByIdAsync(userId)).Email;
    }
}
