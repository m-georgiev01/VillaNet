namespace VillaManager.Core.DTOs;

public class AuthUser
{
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Role { get; set; } = null!;
    public int UserId { get; set; }
}
