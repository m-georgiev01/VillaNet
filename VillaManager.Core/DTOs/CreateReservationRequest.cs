namespace VillaManager.Core.DTOs;
public class CreateReservationRequest
{
    public int PropertyId { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
}
