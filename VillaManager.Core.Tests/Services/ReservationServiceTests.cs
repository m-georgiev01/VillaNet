using Microsoft.Extensions.Options;
using MockQueryable;
using Moq;
using VillaManager.Core.Common;
using VillaManager.Core.DTOs;
using VillaManager.Core.Services;
using VillaManager.Infrastructure.Configs;
using VillaManager.Infrastructure.Data.Entities;
using VillaManager.Infrastructure.Kafka;
using VillaManager.Infrastructure.Repository;

namespace VillaManager.Core.Tests.Services;

[TestFixture]
public class ReservationServiceTests
{
    private Mock<IOptions<KafkaConfig>> _kafkaConfig;
    private Mock<IRepository<Reservation>> _reservationRepo;
    private Mock<IPropertyService> _propertyService;
    private Mock<IUserService> _userService;
    private Mock<IKafkaProducer<int, ReservationEvent>> _reservationProducer;
    private Mock<IKafkaProducer<int, ReservationCanceledEvent>> _reservationCanceledProducer;
    private IReservationService _service;

    [SetUp]
    public void Setup()
    {
        _kafkaConfig = new();
        _reservationRepo = new();
        _propertyService = new();
        _userService = new();
        _reservationProducer = new();
        _reservationCanceledProducer = new();

        var config = new KafkaConfig
        {
            CreatedReservationsTopic = "created-reservations",
            CancelledReservationsTopic = "cancelled-reservations"
        };
        _kafkaConfig.Setup(c => c.Value).Returns(config);

        _service = new ReservationService(
            _kafkaConfig.Object,
            _reservationRepo.Object,
            _propertyService.Object,
            _userService.Object,
            _reservationProducer.Object,
            _reservationCanceledProducer.Object);
    }

    [Test]
    public void CreateReservationAsync_EndDateBeforeStartDate_ThrowsArgumentException()
    {
        var req = new CreateReservationRequest
        {
            PropertyId = 1,
            StartDate = new DateOnly(2025, 6, 10),
            EndDate = new DateOnly(2025, 6, 9)
        };

        Assert.ThrowsAsync<ArgumentException>(async () =>
            await _service.CreateReservationAsync(1, req));
    }

    [Test]
    public async Task CreateReservationAsync_PropertyNotFound_ThrowsKeyNotFoundException()
    {
        _propertyService.Setup(p => p.GetByIdAsync(5)).ReturnsAsync((PropertyDTO)null);
        var req = new CreateReservationRequest
        {
            PropertyId = 5,
            StartDate = new DateOnly(2025, 6, 10),
            EndDate = new DateOnly(2025, 6, 12)
        };

        Assert.ThrowsAsync<KeyNotFoundException>(async () =>
            await _service.CreateReservationAsync(1, req));
    }

    [Test]
    public void CreateReservationAsync_HasConflict_ThrowsInvalidOperationException()
    {
        var propertyDto = new PropertyDTO { Id = 2, PricePerNight = 100m, OwnerId = 3, Name = "Test" };
        _propertyService.Setup(p => p.GetByIdAsync(2)).ReturnsAsync(propertyDto);
        
        var existing = new List<Reservation>
            {
                new ()
                {
                    PropertyId = 2,
                    StartDate = new DateOnly(2025, 6, 12),
                    EndDate = new DateOnly(2025, 6, 15)
                }
            }.AsQueryable().BuildMock();

        _reservationRepo.Setup(r => r.GetAllReadOnly()).Returns(existing);
        
        var req = new CreateReservationRequest
        {
            PropertyId = 2,
            StartDate = new DateOnly(2025, 6, 14),
            EndDate = new DateOnly(2025, 6, 16)
        };

        Assert.ThrowsAsync<InvalidOperationException>(async () =>
            await _service.CreateReservationAsync(1, req));
    }

    [Test]
    public async Task CreateReservationAsync_ValidReservation_CreatesAndPublishesEvent()
    {
        var propertyDto = new PropertyDTO { Id = 2, PricePerNight = 50m, OwnerId = 4, Name = "Prop" };
        _propertyService.Setup(p => p.GetByIdAsync(2)).ReturnsAsync(propertyDto);
        _reservationRepo.Setup(r => r.GetAllReadOnly()).Returns(new List<Reservation>().AsQueryable().BuildMock());

        Reservation added = null;
        _reservationRepo.Setup(r => r.AddAsync(It.IsAny<Reservation>()))
            .Callback<Reservation>(r => { r.Id = 99; added = r; })
            .Returns(Task.CompletedTask);
        _reservationRepo.Setup(r => r.SaveAsync()).Returns(Task.CompletedTask);

        _userService.Setup(u => u.GetUserEmail(1)).ReturnsAsync("user@example.com");
        _userService.Setup(u => u.GetUserEmail(4)).ReturnsAsync("owner@example.com");

        var req = new CreateReservationRequest
        {
            PropertyId = 2,
            StartDate = new DateOnly(2025, 6, 10),
            EndDate = new DateOnly(2025, 6, 12)
        };

        var dto = await _service.CreateReservationAsync(1, req);

        Assert.Multiple(() =>
        {
            Assert.That(dto.Id, Is.EqualTo(99));
            Assert.That(dto.PropertyId, Is.EqualTo(2));
            Assert.That(dto.PropertyName, Is.EqualTo("Prop"));
            Assert.That(dto.StartDate, Is.EqualTo(new DateOnly(2025, 6, 10)));
            Assert.That(dto.EndDate, Is.EqualTo(new DateOnly(2025, 6, 12)));
            Assert.That(dto.TotalNights, Is.EqualTo(2));
            Assert.That(dto.TotalPrice, Is.EqualTo(100m));
        });

        _reservationProducer.Verify(p => p.SendAsync(
            "created-reservations",
            99,
            It.Is<ReservationEvent>(e =>
                e.ReservationId == 99 &&
                e.StartDate == req.StartDate &&
                e.EndDate == req.EndDate &&
                e.TotalPrice == 100m &&
                e.BookedBy == "user@example.com" &&
                e.OwnerEmail == "owner@example.com")), Times.Once);
    }

    [Test]
    public void CancelReservationAsync_NotFound_ThrowsKeyNotFoundException()
    {
        _reservationRepo.Setup(r => r.GetAll()).Returns(new List<Reservation>().AsQueryable().BuildMock());
        
        Assert.ThrowsAsync<KeyNotFoundException>(async () =>
            await _service.CancelReservationAsync(1, 5));
    }

    [Test]
    public void CancelReservationAsync_NotOwner_ThrowsUnauthorizedAccessException()
    {
        var startDate = DateOnly.FromDateTime(DateTime.Now).AddDays(10);
        var reservations = new List<Reservation>
            {
                new ()
                {
                    Id = 5,
                    UserId = 2,
                    StartDate = startDate,
                    Property = new Property { OwnerId = 7 }
                }
            }.AsQueryable().BuildMock();

        _reservationRepo.Setup(r => r.GetAll()).Returns(reservations);

        Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
            await _service.CancelReservationAsync(1, 5));
    }

    [Test]
    public void CancelReservationAsync_TooLate_ThrowsArgumentException()
    {
        var startDate = DateOnly.FromDateTime(DateTime.Now).AddDays(2);
        var reservations = new List<Reservation>
            {
                new Reservation
                {
                    Id = 6,
                    UserId = 1,
                    StartDate = startDate,
                    Property = new Property { OwnerId = 1 }
                }
            }.AsQueryable().BuildMock();

        _reservationRepo.Setup(r => r.GetAll()).Returns(reservations);

        Assert.ThrowsAsync<ArgumentException>(async () =>
            await _service.CancelReservationAsync(1, 6));
    }

    [Test]
    public async Task CancelReservationAsync_Valid_CancelsAndPublishesEvent()
    {
        var startDate = DateOnly.FromDateTime(DateTime.Now).AddDays(5);
        var reservation = new Reservation
        {
            Id = 7,
            UserId = 3,
            StartDate = startDate,
            EndDate = startDate.AddDays(2),
            Property = new Property { Id = 8, Name = "TestProp", OwnerId = 9 }
        };

        _reservationRepo.Setup(r => r.GetAll()).Returns(new List<Reservation> { reservation }.AsQueryable().BuildMock());
        _reservationRepo.Setup(r => r.Delete(7)).Returns(Task.CompletedTask);
        _reservationRepo.Setup(r => r.SaveAsync()).Returns(Task.CompletedTask);

        _userService.Setup(u => u.GetUserEmail(3)).ReturnsAsync("cust@example.com");
        _userService.Setup(u => u.GetUserEmail(9)).ReturnsAsync("owner2@example.com");

        await _service.CancelReservationAsync(3, 7);

        _reservationRepo.Verify(r => r.Delete(7), Times.Once);
        _reservationCanceledProducer.Verify(p => p.SendAsync(
            "cancelled-reservations",
            7,
            It.Is<ReservationCanceledEvent>(e =>
                e.ReservationId == 7 &&
                e.PropertyName == "TestProp" &&
                e.BookedBy == "cust@example.com" &&
                e.OwnerEmail == "owner2@example.com")), Times.Once);
    }

    [Test]
    public async Task GetUserReservationsAsync_ReturnsPagedUserReservations()
    {
        var now = DateTime.UtcNow;
        var list = new List<Reservation>
            {
                new Reservation { Id = 1, UserId = 4, CreatedAt = now.AddDays(-1), PropertyId = 10, Property = new Property { Name = "P1" }, StartDate = DateOnly.MinValue, EndDate = DateOnly.MinValue, TotalNights = 1, TotalPrice = 100m },
                new Reservation { Id = 2, UserId = 4, CreatedAt = now, PropertyId = 11, Property = new Property { Name = "P2" }, StartDate = DateOnly.MinValue, EndDate = DateOnly.MinValue, TotalNights = 2, TotalPrice = 200m }
            }.AsQueryable().BuildMock();
        _reservationRepo.Setup(r => r.GetAllReadOnly()).Returns(list);

        var page = await _service.GetUserReservationsAsync(4, new PaginationParams { PageNumber = 1, PageSize = 1 });

        Assert.Multiple(() =>
        {
            Assert.That(page.Items, Has.Count.EqualTo(1));
            Assert.That(page.Items.First().Id, Is.EqualTo(2));
            Assert.That(page.Items.First().PropertyName, Is.EqualTo("P2"));
        });
    }

    [Test]
    public async Task GetReservationsForPropertyAsync_NotFound_ThrowsKeyNotFoundException()
    {
        _propertyService.Setup(p => p.GetByIdAsync(20)).ReturnsAsync((PropertyDTO)null);

        Assert.ThrowsAsync<KeyNotFoundException>(async () =>
            await _service.GetReservationsForPropertyAsync(20, 5, new PaginationParams()));
    }

    [Test]
    public async Task GetReservationsForPropertyAsync_NotOwner_ThrowsUnauthorizedAccessException()
    {
        var propDto = new PropertyDTO { Id = 30, OwnerId = 7 };
        _propertyService.Setup(p => p.GetByIdAsync(30)).ReturnsAsync(propDto);

        Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
            await _service.GetReservationsForPropertyAsync(30, 8, new PaginationParams()));
    }

    [Test]
    public async Task GetReservationsForPropertyAsync_Valid_ReturnsPagedOwnerReservations()
    {
        var propDto = new PropertyDTO { Id = 40, OwnerId = 9 };
        _propertyService.Setup(p => p.GetByIdAsync(40)).ReturnsAsync(propDto);

        var reservations = new List<Reservation>
            {
                new() { Id = 5, PropertyId = 40, Property = new Property { Name = "PropX" }, User = new User { Username = "UserA" }, StartDate = DateOnly.MinValue, EndDate = DateOnly.MinValue, TotalNights = 1, TotalPrice = 150m }
            }.AsQueryable().BuildMock();
        _reservationRepo.Setup(r => r.GetAllReadOnly()).Returns(reservations);

        var page = await _service.GetReservationsForPropertyAsync(40, 9, new PaginationParams ());

        Assert.Multiple(() =>
        {
            Assert.That(page.Items, Has.Count.EqualTo(1));
            Assert.That(page.Items.First().Id, Is.EqualTo(5));
            Assert.That(page.Items.First().PropertyName, Is.EqualTo("PropX"));
            Assert.That(page.Items.First().BookedByUsername, Is.EqualTo("UserA"));
        });
    }
}

