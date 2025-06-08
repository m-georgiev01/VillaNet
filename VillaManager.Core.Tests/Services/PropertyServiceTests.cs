using Microsoft.AspNetCore.Http;
using MockQueryable;
using Moq;
using VillaManager.Core.Common;
using VillaManager.Core.DTOs;
using VillaManager.Core.Services;
using VillaManager.Infrastructure.Data.Entities;
using VillaManager.Infrastructure.Repository;

namespace VillaManager.Core.Tests.Services;

[TestFixture]
public class PropertyServiceTests
{
    private Mock<IRepository<Property>> _repo;
    private Mock<IImageService> _imageService;
    private IPropertyService _service;

    [SetUp]
    public void SetUp()
    {
        _repo = new();
        _imageService = new();
        _service = new PropertyService(_repo.Object, _imageService.Object);
    }

    [Test]
    public async Task GetAllAsync_ReturnsPagedList_WithCorrectItems()
    {
        var props = new List<Property>
        {
            new() { Id = 1, Name = "A", Location = "LocA", PricePerNight = 10, Description = "DescA", Capacity = 2, Image = "img1", OwnerId = 1 },
            new() { Id = 2, Name = "B", Location = "LocB", PricePerNight = 20, Description = "DescB", Capacity = 4, Image = "img2", OwnerId = 2 },
            new() { Id = 3, Name = "C", Location = "LocC", PricePerNight = 30, Description = "DescC", Capacity = 6, Image = "img3", OwnerId = 3 }
        };

        _repo.Setup(r => r.GetAllReadOnly())
            .Returns(props.AsQueryable().BuildMock());

        var pagination = new PaginationParams { PageNumber = 1, PageSize = 2 };
        var result = await _service.GetAllAsync(pagination);

        Assert.Multiple(() =>
        {
            Assert.That(result.Items, Has.Count.EqualTo(2));
            Assert.That(result.Items.First().Id, Is.EqualTo(1));
            Assert.That(result.Items.Last().Id, Is.EqualTo(2));
        });
    }

    [Test]
    public void GetByIdAsync_PropertyNotFound_ThrowsKeyNotFoundException()
    {
        _repo.Setup(r => r.GetByIdAsync(5)).ReturnsAsync((Property)null);
        Assert.ThrowsAsync<KeyNotFoundException>(async () =>
            await _service.GetByIdAsync(5));
    }

    [Test]
    public async Task GetByIdAsync_ReturnsPropertyDTO()
    {
        var prop = new Property { Id = 10, Name = "X", Location = "LocX", PricePerNight = 99.99m, Description = "DescX", Capacity = 8, Image = "imgX", OwnerId = 7 }; 
        _repo.Setup(r => r.GetByIdAsync(10)).ReturnsAsync(prop);
        var dto = await _service.GetByIdAsync(10);

        Assert.Multiple(() =>
        {
            Assert.That(dto.Id, Is.EqualTo(prop.Id));
            Assert.That(dto.Name, Is.EqualTo(prop.Name));
            Assert.That(dto.Location, Is.EqualTo(prop.Location));
            Assert.That(dto.PricePerNight, Is.EqualTo(prop.PricePerNight));
            Assert.That(dto.Description, Is.EqualTo(prop.Description));
            Assert.That(dto.Capacity, Is.EqualTo(prop.Capacity));
            Assert.That(dto.Image, Is.EqualTo(prop.Image));
            Assert.That(dto.OwnerId, Is.EqualTo(prop.OwnerId));
        });
    }

    [Test]
    public async Task GetAllForOwnerAsync_ReturnsOnlyOwnerProperties()
    {
        var props = new List<Property>
        {
            new() { Id = 1, OwnerId = 1 },
            new() { Id = 2, OwnerId = 2 },
            new() { Id = 3, OwnerId = 1 }
        };
        _repo.Setup(r => r.GetAllReadOnly()).Returns(props.AsQueryable().BuildMock());
        var pagination = new PaginationParams { PageNumber = 1, PageSize = 10 };

        var result = await _service.GetAllForOwnerAsync(1, pagination);

        Assert.Multiple(() =>
        {
            Assert.That(result.Items.All(d => d.OwnerId == 1), Is.True);
            Assert.That(result.Items, Has.Count.EqualTo(2));
            CollectionAssert.AreEquivalent(new[] { 1, 3 }, result.Items.Select(d => d.Id));
        });
    }

    [Test]
    public async Task CreateAsync_ValidRequest_ReturnsPropertyDTOAndSaves()
    {
        var imageMock = new Mock<IFormFile>();
        var req = new CreatePropertyRequest
        {
            Name = "New",
            Description = "NewDesc",
            PricePerNight = 123m,
            Location = "NewLoc",
            Capacity = 5,
            Image = imageMock.Object
        };
        var ownerId = 42;
        _imageService.Setup(s => s.SaveImageAsync(imageMock.Object))
            .ReturnsAsync("images/new.png");

        Property saved = null;
        _repo.Setup(r => r.AddAsync(It.IsAny<Property>()))
            .Callback<Property>(p => { p.Id = 99; saved = p; })
            .Returns(Task.CompletedTask);

        _repo.Setup(r => r.SaveAsync()).Returns(Task.CompletedTask);
        var dto = await _service.CreateAsync(req, ownerId);

        Assert.Multiple(() =>
        {
            Assert.That(dto.Id, Is.EqualTo(99));
            Assert.That(dto.Name, Is.EqualTo(req.Name));
            Assert.That(dto.Location, Is.EqualTo(req.Location));
            Assert.That(dto.PricePerNight, Is.EqualTo(req.PricePerNight));
            Assert.That(dto.Description, Is.EqualTo(req.Description));
            Assert.That(dto.Capacity, Is.EqualTo(req.Capacity));
            Assert.That(req.Image, Is.EqualTo(req.Image));
            Assert.That(dto.OwnerId, Is.EqualTo(ownerId));
            Assert.That(dto.Image, Is.EqualTo("images/new.png"));
        });

        _repo.Verify(r => r.AddAsync(It.Is<Property>(p => p == saved)), Times.Once);
        _repo.Verify(r => r.SaveAsync(), Times.Once);
    }

    [Test]
    public void UpdateAsync_PropertyNotFound_ThrowsKeyNotFoundException()
    {
        _repo.Setup(r => r.GetByIdAsync(7)).ReturnsAsync((Property)null);

        Assert.ThrowsAsync<KeyNotFoundException>(async () =>
            await _service.UpdateAsync(7, new UpdatePropertyRequest(), 1));
    }

    [Test]
    public void UpdateAsync_NotOwner_ThrowsUnauthorizedAccessException()
    {
        var prop = new Property { Id = 7, OwnerId = 2 };
        _repo.Setup(r => r.GetByIdAsync(7)).ReturnsAsync(prop);

        Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
            await _service.UpdateAsync(7, new UpdatePropertyRequest(), ownerId: 1));
    }

    [Test]
    public async Task UpdateAsync_ValidUpdate_ReturnsUpdatedDTOAndCallsUpdate()
    {
        var existing = new Property
        {
            Id = 5,
            Name = "Old",
            Description = "OldDesc",
            PricePerNight = 50m,
            Location = "OldLoc",
            Capacity = 3,
            Image = "imgOld",
            OwnerId = 10
        };

        _repo.Setup(r => r.GetByIdAsync(5)).ReturnsAsync(existing);

        var req = new UpdatePropertyRequest
        {
            Name = "Updated",
            Description = "UpdatedDesc",
            PricePerNight = 75m
        };

        _repo.Setup(r => r.Update(existing));
        _repo.Setup(r => r.SaveAsync()).Returns(Task.CompletedTask);

        var dto = await _service.UpdateAsync(5, req, 10);

        Assert.Multiple(() =>
        {
            Assert.That(dto.Id, Is.EqualTo(existing.Id));
            Assert.That(existing.Name, Is.EqualTo("Updated"));
            Assert.That(existing.Description, Is.EqualTo("UpdatedDesc"));
            Assert.That(existing.PricePerNight, Is.EqualTo(75m));
            Assert.That(dto.Name, Is.EqualTo(existing.Name));
            Assert.That(dto.Description, Is.EqualTo(existing.Description));
            Assert.That(dto.PricePerNight, Is.EqualTo(existing.PricePerNight));
        });

        _repo.Verify(r => r.Update(existing), Times.Once);
        _repo.Verify(r => r.SaveAsync(), Times.Once);
    }

    [Test]
    public void DeleteAsync_PropertyNotFound_ThrowsKeyNotFoundException()
    {
        _repo.Setup(r => r.GetByIdAsync(3)).ReturnsAsync((Property)null);

        Assert.ThrowsAsync<KeyNotFoundException>(async () =>
            await _service.DeleteAsync(3, ownerId: 1));
    }

    [Test]
    public void DeleteAsync_NotOwner_ThrowsUnauthorizedAccessException()
    {
        var prop = new Property { Id = 3, OwnerId = 5, Image = "img" };
        _repo.Setup(r => r.GetByIdAsync(3)).ReturnsAsync(prop);

        Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
            await _service.DeleteAsync(3, ownerId: 1));
    }

    [Test]
    public async Task DeleteAsync_ValidDelete_CallsRepositoryAndImageService()
    {
        var prop = new Property { Id = 2, OwnerId = 4, Image = "images/delete.png" };
        _repo.Setup(r => r.GetByIdAsync(2)).ReturnsAsync(prop);
        _repo.Setup(r => r.Delete(2)).Returns(Task.CompletedTask);
        _repo.Setup(r => r.SaveAsync()).Returns(Task.CompletedTask);

        await _service.DeleteAsync(2, ownerId: 4);

        _repo.Verify(r => r.Delete(2), Times.Once);
        _imageService.Verify(s => s.DeleteImage(prop.Image), Times.Once);
        _repo.Verify(r => r.SaveAsync(), Times.Once);
    }

}
