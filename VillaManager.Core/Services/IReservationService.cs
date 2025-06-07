using VillaManager.Core.Common;
using VillaManager.Core.DTOs;

namespace VillaManager.Core.Services;

public interface IReservationService
{
    Task<ReservationDTO> CreateReservationAsync(int userId, CreateReservationRequest request);
    Task CancelReservationAsync(int userId, int reservationId);
    Task<PagedList<ReservationDTO>> GetUserReservationsAsync(int userId, PaginationParams paginationParams);
    Task<PagedList<ReservationOwnerDTO>> GetReservationsForPropertyAsync(int propertyId, int ownerId, PaginationParams pagination);
}
