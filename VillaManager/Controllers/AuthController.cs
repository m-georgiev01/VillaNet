using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using VillaManager.Core.DTOs;
using VillaManager.Core.Exceptions;
using VillaManager.Core.Services;

namespace VillaManager.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController(IAuthService authService) : ControllerBase
{
    private readonly IAuthService _authService = authService;

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] UserLoginRequest request)
    {
        try
        {
            var authResponse = await _authService.LoginAsync(request);

            Response.Cookies.Append("token", authResponse.Token, new CookieOptions()
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddMinutes(30)
            });

            return Ok(new AuthUser()
            {
                Username = authResponse.Username,
                Role = authResponse.Role,
                Email = authResponse.Email,
                UserId = authResponse.UserId
            });
        }
        catch (InvalidCredentialsException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterUserRequest request)
    {
        try
        {
            var authResponse = await _authService.RegisterAsync(request);

            Response.Cookies.Append("token", authResponse.Token, new CookieOptions()
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddMinutes(30)
            });

            return Ok(new AuthUser()
            {
                Username = authResponse.Username,
                Role = authResponse.Role,
                Email = authResponse.Email,
                UserId = authResponse.UserId
            });
        }
        catch (UserAlreadyExistsException ex)
        {
            return Conflict(ex.Message);
        }
        catch (RoleNotFoundException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [Authorize]
    [HttpGet("user")]
    public IActionResult GetCurrentUser()
    {
        var user = HttpContext.User;
        var username = user.FindFirst(ClaimTypes.Name)?.Value;
        var email = user.FindFirst(ClaimTypes.Email)?.Value;
        var role = user.FindFirst(ClaimTypes.Role)?.Value;
        var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (username is null || email is null || role is null || userId is null)
        {
            return StatusCode(StatusCodes.Status401Unauthorized);
        }

        return Ok(new AuthUser()
        {
            Email = email,
            Role = role,
            Username = username,
            UserId = int.Parse(userId)
        });
    }

    [Authorize]
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("token");
        return NoContent();
    }
}
