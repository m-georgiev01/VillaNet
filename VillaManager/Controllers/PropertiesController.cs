using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using VillaManager.Core.Common;
using VillaManager.Core.DTOs;
using VillaManager.Core.Services;

namespace VillaManager.Controllers;
[Route("api/[controller]")]
[ApiController]
public class PropertiesController(IPropertyService propertyService) : ControllerBase
{
    private readonly IPropertyService _propertyService = propertyService;

    [HttpGet]
    public async Task<ActionResult<PagedList<PropertyDTO>>> GetAll([FromQuery] PaginationParams paginationParams)
    {
        var result = await _propertyService.GetAllAsync(paginationParams);
        return Ok(result);
    }

    [HttpGet("my")]
    [Authorize(AuthenticationSchemes = "Bearer,Cookie", Roles = "Owner")]
    public async Task<ActionResult<PagedList<PropertyDTO>>> GetAllForOwner([FromQuery] PaginationParams paginationParams)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await _propertyService.GetAllForOwnerAsync(userId, paginationParams);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        try
        {
            var prop = await _propertyService.GetByIdAsync(id);
            return Ok(prop);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpPost]
    [Authorize(AuthenticationSchemes = "Bearer,Cookie", Roles = "Owner")]
    public async Task<IActionResult> Create(CreatePropertyRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var prop = await _propertyService.CreateAsync(request, userId);
        return Ok(prop);
    }

    [HttpPut("{id}")]
    [Authorize(AuthenticationSchemes = "Bearer,Cookie", Roles = "Owner")]
    public async Task<IActionResult> Update(int id, UpdatePropertyRequest request)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var prop = await _propertyService.UpdateAsync(id, request, userId);
            return Ok(prop);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, ex.Message);
        }
    }

    [HttpDelete("{id}")]
    [Authorize(AuthenticationSchemes = "Bearer,Cookie", Roles = "Owner")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            await _propertyService.DeleteAsync(id, userId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, ex.Message);
        }
    }
}
