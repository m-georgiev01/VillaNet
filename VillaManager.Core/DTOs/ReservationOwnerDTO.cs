namespace VillaManager.Core.DTOs;
public class ReservationOwnerDTO : ReservationDTO
{
    public string BookedByUsername { get; set; } = null!;
}
