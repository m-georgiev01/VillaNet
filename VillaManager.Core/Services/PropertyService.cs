using Microsoft.EntityFrameworkCore;
using VillaManager.Core.Common;
using VillaManager.Core.DTOs;
using VillaManager.Infrastructure.Data.Entities;
using VillaManager.Infrastructure.Repository;

namespace VillaManager.Core.Services;
internal class PropertyService(IRepository<Property> propertyRepository, IImageService imageService) : IPropertyService
{
    private readonly IRepository<Property> _propertyRepository = propertyRepository;
    private readonly IImageService _imageService = imageService;

    public async Task<PagedList<PropertyDTO>> GetAllAsync(PaginationParams paginationParams)
    {
        var query = _propertyRepository.GetAllReadOnly()
            .Include(p => p.Owner)
            .Select(p => new PropertyDTO
            {
                Id = p.Id,
                Name = p.Name,
                Location = p.Location,
                PricePerNight = p.PricePerNight,
                Description = p.Description,
                Capacity = p.Capacity,
                Image = p.Image,
                OwnerId = p.OwnerId,
            });

        return await PagedList<PropertyDTO>.CreateAsync(query, paginationParams.PageNumber, paginationParams.PageSize);
    }

    public async Task<PropertyDTO> GetByIdAsync(int id)
    {
        var property = await _propertyRepository.GetByIdAsync(id) ?? throw new KeyNotFoundException($"Property not found.");

        return new PropertyDTO
        {
            Id = property.Id,
            Name = property.Name,
            Description = property.Description,
            Location = property.Location,
            PricePerNight = property.PricePerNight,
            Capacity= property.Capacity,
            Image = property.Image,
            OwnerId = property.OwnerId
        };
    }

    public async Task<PagedList<PropertyDTO>> GetAllForOwnerAsync(int ownerId, PaginationParams paginationParams)
    {
        var query = _propertyRepository.GetAllReadOnly()
            .Where(p => p.OwnerId == ownerId)
            .Select(p => new PropertyDTO
            {
                Id = p.Id,
                Name = p.Name,
                Location = p.Location,
                PricePerNight = p.PricePerNight,
                Description = p.Description,
                Capacity = p.Capacity,
                Image = p.Image,
                OwnerId = p.OwnerId,
            });

        return await PagedList<PropertyDTO>.CreateAsync(query, paginationParams.PageNumber, paginationParams.PageSize);
    }

    public async Task<PropertyDTO> CreateAsync(CreatePropertyRequest request, int ownerId)
    {
        var image = await _imageService.SaveImageAsync(request.Image);

        var prop = new Property
        {
            Name = request.Name,
            Description = request.Description,
            PricePerNight = request.PricePerNight,
            Location = request.Location,
            Capacity = request.Capacity,
            Image = image,
            OwnerId = ownerId
        };

        await _propertyRepository.AddAsync(prop);
        await _propertyRepository.SaveAsync();

        return new PropertyDTO
        {
            Id = prop.Id,
            Name = prop.Name,
            Location = prop.Location,
            PricePerNight = prop.PricePerNight,
            Description = prop.Description,
            Capacity = prop.Capacity,
            Image = prop.Image,
            OwnerId = prop.OwnerId
        };
    }

    public async Task<PropertyDTO> UpdateAsync(int id, UpdatePropertyRequest request, int ownerId)
    {
        var prop = await _propertyRepository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Property not found");
        if (prop.OwnerId != ownerId)
            throw new UnauthorizedAccessException("You are not the owner of this property");

        prop.Name = request.Name;
        prop.Description = request.Description;
        prop.PricePerNight = request.PricePerNight;

        _propertyRepository.Update(prop);
        await _propertyRepository.SaveAsync();

        return new PropertyDTO
        {
            Id = prop.Id,
            Name = prop.Name,
            Location = prop.Location,
            PricePerNight = prop.PricePerNight,
            Description = prop.Description,
            Capacity = prop.Capacity,
            Image = prop.Image,
            OwnerId = prop.OwnerId
        };
    }

    public async Task DeleteAsync(int id, int ownerId)
    {
        var prop = await _propertyRepository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Property not found");
        if (prop.OwnerId != ownerId)
            throw new UnauthorizedAccessException("You are not the owner of this property");

        await _propertyRepository.Delete(id);
        _imageService.DeleteImage(prop.Image);
        await _propertyRepository.SaveAsync();
    }
}
