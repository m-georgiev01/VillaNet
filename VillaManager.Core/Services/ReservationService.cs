using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using VillaManager.Core.Common;
using VillaManager.Core.DTOs;
using VillaManager.Infrastructure.Configs;
using VillaManager.Infrastructure.Data.Entities;
using VillaManager.Infrastructure.Kafka;
using VillaManager.Infrastructure.Repository;

namespace VillaManager.Core.Services;

internal class ReservationService(
    IOptions<KafkaConfig> kafkaConfig,
    IRepository<Reservation> reservationRepo,
    IPropertyService propertyService,
    IUserService userService,
    IKafkaProducer<int, ReservationEvent> reservationProducer,
    IKafkaProducer<int, ReservationCanceledEvent> reservationCanceledProducer) : IReservationService
{
    private readonly IOptions<KafkaConfig> _kafkaConfig = kafkaConfig;
    private readonly IRepository<Reservation> _reservationRepo = reservationRepo;
    private readonly IPropertyService _propertyService = propertyService;
    private readonly IUserService _userService = userService;
    private readonly IKafkaProducer<int, ReservationEvent> _reservationProducer = reservationProducer;
    private readonly IKafkaProducer<int, ReservationCanceledEvent> _reservationCanceledProducer = reservationCanceledProducer;
    private const int MinimumDaysBeforeCancelation = 3;

    public async Task<ReservationDTO> CreateReservationAsync(int userId, CreateReservationRequest request)
    {
        if (request.EndDate <= request.StartDate)
            throw new ArgumentException("End date must be after start date.");

        var property = await _propertyService.GetByIdAsync(request.PropertyId)
            ?? throw new KeyNotFoundException("Property not found.");

        bool hasConflict = await _reservationRepo.GetAllReadOnly()
            .Where(r => r.PropertyId == request.PropertyId)
            .AnyAsync(r => request.StartDate < r.EndDate &&
                           request.EndDate > r.StartDate);

        if (hasConflict)
            throw new InvalidOperationException("The selected dates are not available.");

        int totalNights = request.EndDate.DayNumber - request.StartDate.DayNumber;
        if (totalNights <= 0)
        {
            throw new ArgumentException("Booking must be for at least one night");
        }

        decimal totalPrice = totalNights * property.PricePerNight;

        var reservation = new Reservation
        {
            PropertyId = request.PropertyId,
            UserId = userId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            TotalNights = totalNights,
            TotalPrice = totalPrice
        };

        await _reservationRepo.AddAsync(reservation);
        await _reservationRepo.SaveAsync();

        var userEmail = await _userService.GetUserEmail(userId);
        var ownerEmail = await _userService.GetUserEmail(property.OwnerId);
        var reservationEvent = new ReservationEvent()
        {
            ReservationId = reservation.Id,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            TotalNights = reservation.TotalNights,
            TotalPrice = reservation.TotalPrice,
            BookedBy = userEmail,
            OwnerEmail = ownerEmail
        };

        _reservationProducer.SendAsync(_kafkaConfig.Value.CreatedReservationsTopic, reservation.Id, reservationEvent);

        return new ReservationDTO
        {
            Id = reservation.Id,
            PropertyId = reservation.PropertyId,
            PropertyName = property.Name,
            StartDate = reservation.StartDate,
            EndDate = reservation.EndDate,
            TotalNights = totalNights,
            TotalPrice = totalPrice
        };
    }

    public async Task CancelReservationAsync(int userId, int reservationId)
    {
        var reservation = await _reservationRepo.GetAll()
            .Include(r => r.Property)
            .FirstOrDefaultAsync(r => r.Id == reservationId)
            ?? throw new KeyNotFoundException("Reservation not found.");

        if (reservation.UserId != userId)
            throw new UnauthorizedAccessException("You cannot cancel this reservation.");

        if (reservation.StartDate.DayNumber - DateOnly.FromDateTime(DateTime.Now).DayNumber <= MinimumDaysBeforeCancelation)
            throw new ArgumentException($"Cancellation is not allowed within {MinimumDaysBeforeCancelation} days of the reservation start date.");

        await _reservationRepo.Delete(reservationId);
        await _reservationRepo.SaveAsync();

        var customerEmail = await _userService.GetUserEmail(userId);
        var ownerEmail = await _userService.GetUserEmail(reservation.Property.OwnerId);
        var reservationCanceledEvent = new ReservationCanceledEvent()
        {
            ReservationId = reservationId,
            PropertyName = reservation.Property.Name,
            BookedBy = customerEmail,
            OwnerEmail = ownerEmail,
            StartDate = reservation.StartDate,
            EndDate = reservation.EndDate
        };

        _reservationCanceledProducer.SendAsync(_kafkaConfig.Value.CancelledReservationsTopic, reservationId, reservationCanceledEvent);
    }

    public async Task<PagedList<ReservationDTO>> GetUserReservationsAsync(int userId, PaginationParams paginationParams)
    {
        var query = _reservationRepo.GetAllReadOnly()
            .Where(r => r.UserId == userId)
            .Include(r => r.Property)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReservationDTO()
            {
                Id = r.Id,
                PropertyId = r.PropertyId,
                PropertyName = r.Property.Name,
                StartDate = r.StartDate,
                EndDate = r.EndDate,
                TotalNights = r.TotalNights,
                TotalPrice = r.TotalPrice
            });

        return await PagedList<ReservationDTO>.CreateAsync(query, paginationParams.PageNumber, paginationParams.PageSize);
    }

    public async Task<PagedList<ReservationOwnerDTO>> GetReservationsForPropertyAsync(int propertyId, int ownerId, PaginationParams pagination)
    {
        var property = await _propertyService.GetByIdAsync(propertyId) ?? throw new KeyNotFoundException("Property not found");

        if (property.OwnerId != ownerId)
            throw new UnauthorizedAccessException("You do not own this property.");

        var query = _reservationRepo
            .GetAllReadOnly()
            .Include(r => r.User)
            .Where(r => r.PropertyId == propertyId)
            .Select(r => new ReservationOwnerDTO
            {
                Id = r.Id,
                PropertyId = r.PropertyId,
                PropertyName = r.Property.Name,
                StartDate = r.StartDate,
                EndDate = r.EndDate,
                TotalNights = r.TotalNights,
                TotalPrice = r.TotalPrice,
                BookedByUsername = r.User.Username
            });

        return await PagedList<ReservationOwnerDTO>.CreateAsync(query, pagination.PageNumber, pagination.PageSize);
    }
}
