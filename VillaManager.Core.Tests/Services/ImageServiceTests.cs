using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Moq;
using VillaManager.Core.Common;
using VillaManager.Core.Services;

namespace VillaManager.Core.Tests.Services;

[TestFixture]
public class ImageServiceTests
{
    private Mock<IWebHostEnvironment> _environment;
    private IImageService _imageService;
    private string _tempWebRoot;

    [SetUp]
    public void Setup()
    {
        _tempWebRoot = Path.Combine(Environment.CurrentDirectory, Guid.NewGuid().ToString());
        Directory.CreateDirectory(_tempWebRoot);
        _environment = new();
        _environment.SetupGet(e => e.WebRootPath).Returns(_tempWebRoot);
        _imageService = new ImageService(_environment.Object);
    }

    [TearDown]
    public void TearDown()
    {
        if (Directory.Exists(_tempWebRoot))
        {
            Directory.Delete(_tempWebRoot, true);
        }
    }

    [Test]
    public void SaveImageAsync_NullImage_ThrowsArgumentNullException()
    {
        Assert.ThrowsAsync<ArgumentNullException>(async () =>
            await _imageService.SaveImageAsync(null));
    }

    [Test]
    public void SaveImageAsync_EmptyImage_ThrowsArgumentNullException()
    {
        var emptyFileMock = new Mock<IFormFile>();
        emptyFileMock.SetupGet(f => f.Length).Returns(0);

        Assert.ThrowsAsync<ArgumentNullException>(async () =>
            await _imageService.SaveImageAsync(emptyFileMock.Object));
    }

    [Test]
    public void SaveImageAsync_InvalidExtension_ThrowsArgumentException()
    {
        var content = new MemoryStream([1, 2, 3]);
        IFormFile file = new FormFile(content, 0, content.Length, "Data", "test.txt");

        var ex = Assert.ThrowsAsync<ArgumentException>(async () =>
            await _imageService.SaveImageAsync(file));

        StringAssert.Contains(string.Join(",", Constants.AllowedFileExtensions), ex.Message);
    }

    [Test]
    public async Task SaveImageAsync_ValidImage_SavesAndReturnsPath()
    {
        var ext = Constants.AllowedFileExtensions.First();
        var fileName = $"test{ext}";
        var content = new MemoryStream([1, 2, 3]);
        IFormFile file = new FormFile(content, 0, content.Length, "Data", fileName);
        var result = await _imageService.SaveImageAsync(file);

        var fullPath = Path.Combine(_tempWebRoot, result);
        Assert.Multiple(() =>
        {
            Assert.That(result, Does.StartWith("images/"));
            Assert.That(ext, Is.EqualTo(Path.GetExtension(result)));
            Assert.That(File.Exists(fullPath));
        });
    }

    [Test]
    public void DeleteImage_NullOrEmpty_DoesNothing()
    {
        Assert.Multiple(() =>
        {
            Assert.DoesNotThrow(() => _imageService.DeleteImage(null));
            Assert.DoesNotThrow(() => _imageService.DeleteImage(string.Empty));
        });
    }

    [Test]
    public void DeleteImage_ExistingFile_DeletesFile()
    {
        var imagesFolder = Path.Combine(_tempWebRoot, "images");
        Directory.CreateDirectory(imagesFolder);

        var fileName = $"toDelete{Constants.AllowedFileExtensions.First()}";
        var filePath = Path.Combine(imagesFolder, fileName);
        File.WriteAllText(filePath, "data");

        Assert.That(File.Exists(filePath));

        _imageService.DeleteImage($"images/{fileName}");
        Assert.That(File.Exists(filePath), Is.False);
    }
}