using Microsoft.AspNetCore.Http;

namespace VillaManager.Core.Services;
public interface IImageService
{
    Task<string> SaveImageAsync(IFormFile image);
    void DeleteImage(string imageUrl);
}
