using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using VillaManager.Core.Common;
using VillaManager.Core.DTOs;
using VillaManager.Core.Services;

namespace VillaManager.Controllers;
[Route("api/[controller]")]
[ApiController]
public class ReservationsController(IReservationService reservationService) : ControllerBase
{
    private readonly IReservationService _reservationService = reservationService;

    [HttpPost]
    [Authorize(AuthenticationSchemes = "Bearer,Cookie", Roles = "Customer")]
    public async Task<ActionResult<ReservationDTO>> CreateReservation([FromBody] CreateReservationRequest request)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        try
        {
            var result = await _reservationService.CreateReservationAsync(userId, request);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    [Authorize(AuthenticationSchemes = "Bearer,Cookie", Roles = "Customer")]
    public async Task<IActionResult> CancelReservation(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        try
        {
            await _reservationService.CancelReservationAsync(userId, id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch(UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status401Unauthorized, ex.Message);
        }
    }

    [HttpGet]
    [Authorize(AuthenticationSchemes = "Bearer,Cookie", Roles = "Customer")]
    public async Task<ActionResult<PagedList<ReservationDTO>>> GetUserReservations([FromQuery] PaginationParams  pagination)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var reservations = await _reservationService.GetUserReservationsAsync(userId, pagination);
        return Ok(reservations);
    }

    [HttpGet("{propertyId}")]
    [Authorize(AuthenticationSchemes = "Bearer,Cookie", Roles = "Owner")]
    public async Task<ActionResult<PagedList<ReservationDTO>>> GetReservationsForProperty(int propertyId, [FromQuery] PaginationParams pagination)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        try
        {
            var reservations = await _reservationService.GetReservationsForPropertyAsync(propertyId, userId, pagination);
            return Ok(reservations);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch(UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status401Unauthorized, ex.Message);
        }
    }
}
