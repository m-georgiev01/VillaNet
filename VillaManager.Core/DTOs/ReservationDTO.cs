namespace VillaManager.Core.DTOs;
public class ReservationDTO
{
    public int Id { get; set; }
    public int PropertyId { get; set; }
    public string PropertyName { get; set; } = null!;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public int TotalNights { get; set; }
    public decimal TotalPrice { get; set; }
}
