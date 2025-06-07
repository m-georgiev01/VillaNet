using ReservationNotifier.Kafka;
using System.Globalization;
using System.Text;

namespace ReservationNotifier.Extensions;

public static class EmailEventExtensions
{
    public const string CreatedReservationSubject = "New Reservation";
    public const string CanceledReservationSubject = "Canceled Reservation";

    public static string GetEmailBody(this ReservationEvent reservationEvent)
    {
        var sb = new StringBuilder();
        sb.AppendLine("<p>Hello,</p>");
        sb.AppendLine("<p>You have received a new reservation for your property.</p>");
        sb.AppendLine("<h3>Reservation Details:</h3>");
        sb.AppendLine("<ul>");
        sb.AppendLine($"  <li><strong>Reservation ID:</strong> {reservationEvent.ReservationId}</li>");
        sb.AppendLine($"  <li><strong>Booked By:</strong> {reservationEvent.BookedBy}</li>");
        sb.AppendLine($"  <li><strong>Start Date:</strong> {reservationEvent.StartDate:D}</li>");
        sb.AppendLine($"  <li><strong>End Date:</strong> {reservationEvent.EndDate:D}</li>");
        sb.AppendLine($"  <li><strong>Total Nights:</strong> {reservationEvent.TotalNights}</li>");
        sb.AppendLine($"  <li><strong>Total Price:</strong> {reservationEvent.TotalPrice.ToString("C", CultureInfo.GetCultureInfo("bg-BG"))}</li>");
        sb.AppendLine($"  <li><strong>Reservation Made At:</strong> {reservationEvent.CreatedAt:G}</li>");
        sb.AppendLine("</ul>");

        sb.Append("<p>Best regards,<br/>VillaNet team</p>");

        return sb.ToString().Trim();
    }

    public static string GetEmailBody(this ReservationCanceledEvent reservationCanceledEvent)
    {
        var sb = new StringBuilder();
        sb.AppendLine("<p>Hello,</p>");
        sb.AppendLine($"<p>We would like to inform you that a reservation for your property <strong>'{reservationCanceledEvent.PropertyName}'</strong> has been <span style=\"color: red;\">canceled</span>.</p>");

        sb.AppendLine("<h3>Reservation Details:</h3>");
        sb.AppendLine("<ul>");
        sb.AppendLine($"  <li><strong>Reservation ID:</strong> {reservationCanceledEvent.ReservationId}</li>");
        sb.AppendLine($"  <li><strong>Start date:</strong> {reservationCanceledEvent.StartDate}</li>");
        sb.AppendLine($"  <li><strong>End date:</strong> {reservationCanceledEvent.EndDate}</li>");
        sb.AppendLine($"  <li><strong>Canceled By:</strong> {reservationCanceledEvent.BookedBy}</li>");
        sb.AppendLine($"  <li><strong>Canceled At:</strong> {reservationCanceledEvent.CanceledAt:G}</li>");
        sb.AppendLine("</ul>");

        sb.AppendLine("<p>If you have any questions or concerns, feel free to contact our support team.</p>");
        sb.AppendLine("<p>Best regards,<br/>VillaNet team</p>");

        return sb.ToString();
    }
}
