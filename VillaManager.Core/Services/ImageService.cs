using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using VillaManager.Core.Common;

namespace VillaManager.Core.Services;
internal class ImageService(IWebHostEnvironment env) : IImageService
{
    private readonly IWebHostEnvironment _env = env;

    public async Task<string> SaveImageAsync(IFormFile image)
    {
        if (image == null || image.Length == 0)
            throw new ArgumentNullException(nameof(image));
        
        var imagesFolder = Path.Combine(_env.WebRootPath, "images");

        if (!Directory.Exists(imagesFolder))
            Directory.CreateDirectory(imagesFolder);

        var ext = Path.GetExtension(image.FileName);
        if (!Constants.AllowedFileExtensions.Contains(ext))
        {
            throw new ArgumentException($"Only {string.Join(",", Constants.AllowedFileExtensions)} are allowed.");
        }

        var uniqueFileName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(imagesFolder, uniqueFileName);

        await using var stream = new FileStream(filePath, FileMode.Create);
        await image.CopyToAsync(stream);

        return $"images/{uniqueFileName}";
    }

    public void DeleteImage(string imageUrl)
    {
        if (string.IsNullOrEmpty(imageUrl))
            return;

        var fileName = Path.GetFileName(imageUrl);
        var filePath = Path.Combine(_env.WebRootPath, "images", fileName);

        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }

        return;
    }
}
