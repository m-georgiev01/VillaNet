using VillaManager.Core.Common;
using VillaManager.Core.DTOs;

namespace VillaManager.Core.Services;
public interface IPropertyService
{
    Task<PagedList<PropertyDTO>> GetAllAsync(PaginationParams paginationParams);
    Task<PagedList<PropertyDTO>> GetAllForOwnerAsync(int ownerId, PaginationParams paginationParams);
    Task<PropertyDTO> GetByIdAsync(int id);
    Task<PropertyDTO> CreateAsync(CreatePropertyRequest request, int ownerId);
    Task<PropertyDTO> UpdateAsync(int id, UpdatePropertyRequest request, int ownerId);
    Task DeleteAsync(int id, int ownerId);
}
