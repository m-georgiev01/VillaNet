namespace VillaManager.Core.Services;
public interface IUserService
{
    Task<string> GetUserEmail(int userId);
}
