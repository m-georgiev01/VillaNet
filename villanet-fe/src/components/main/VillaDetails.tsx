import {
  Typography,
  Button,
  Box,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Pagination,
} from "@mui/material";
import villaStore from "../../stores/villaStore";
import { useNavigate, useParams } from "react-router";
import { VillaMissing } from "../shared/VillaMissing";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { bg } from "date-fns/locale";
import authStore from "../../stores/authStore";
import { ApiBaseUrl } from "../../common/models";
import { useEffect } from "react";
import { observer } from "mobx-react";
import reservationStore from "../../stores/reservationStore";
import { AlertNotification } from "../shared/AlertNotification";
import { ReservationTable } from "../shared/ReservationTable";

export const VillaDetails: React.FC = observer(() => {
  const villaId = Number(useParams().id);
  const navigate = useNavigate();

  const fetchVilla = async () => {
    if (isNaN(villaId)) return;

    await villaStore.getVillaById(villaId);
  };

  useEffect(() => {
    reservationStore.restorePagination();
    villaStore.clearError();
    reservationStore.clearError();
    fetchVilla();
    reservationStore.getReservationsForVilla(villaId);
  }, []);

  const onEdit = () => {
    navigate(`/villas/${villaId}/edit`);
  };

  const onDelete = async () => {
    if (!villaStore.selectedVilla) return;

    await villaStore.deleteVilla(villaStore.selectedVilla.id);
    if (!villaStore.error) {
      villaStore.closeDeletePopUp();
      navigate("/");
    }
  };

  const handleReserve = async () => {
    if (!authStore.isCustomer || !villaStore.selectedVilla) return;

    await reservationStore.reserveVilla(
      villaStore.selectedVilla.id,
      reservationStore.startDate!,
      reservationStore.endDate!
    );

    if (!reservationStore.error) {
      reservationStore.setStartDate(null);
      reservationStore.setEndDate(null, 0);
      navigate("/reservations/my");
    }
  };

  const pageCount = Math.ceil(
    reservationStore.totalCount / reservationStore.pageSize
  );

  const handlePageChange = (pageNumber: number, pageSize: number) => {
    reservationStore.getReservationsForCustomer(pageNumber, pageSize);
  };

  if (!villaStore.selectedVilla) {
    return <VillaMissing />;
  }

  return (
    <>
      <Box display="flex" gap={4} p={4} maxWidth={"60vw"} margin={"0 auto"}>
        {/* Left Box */}
        <Box flexGrow="1" display="flex" flexDirection="column" gap={"14px"}>
          <Box width={"300px"} margin={"0 auto"}>
            <CardMedia
              component="img"
              height="200px"
              src={
                villaStore.selectedVilla.image
                  ? `${ApiBaseUrl}/${villaStore.selectedVilla.image}`
                  : "https://placehold.co/400x200?text=No+Image"
              }
              alt={villaStore.selectedVilla.name}
            />
          </Box>

          <Typography variant="h5">{villaStore.selectedVilla.name}</Typography>
          <Typography variant="body1">
            {villaStore.selectedVilla.pricePerNight.toLocaleString("bg-BG", {
              style: "currency",
              currency: "BGN",
            })}{" "}
            / night
          </Typography>
          <Typography variant="body1">
            Capacity: {villaStore.selectedVilla.capacity} people
          </Typography>
          <Typography variant="body1">
            Location: {villaStore.selectedVilla.location}
          </Typography>
          <Typography variant="body2">
            {villaStore.selectedVilla.description}
          </Typography>
        </Box>

        {/* Right Box */}
        <Box
          display="flex"
          flexDirection="column"
          gap={4}
          justifyContent="center"
        >
          {authStore.isCustomer && (
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={bg}
            >
              <Box display="flex" flexDirection="column" gap={2}>
                <DatePicker
                  label="Start Date"
                  value={reservationStore.startDate}
                  onChange={(date) => reservationStore.setStartDate(date)}
                  disablePast
                />
                {reservationStore.startDate && (
                  <DatePicker
                    label="End Date"
                    value={reservationStore.endDate}
                    onChange={(date) =>
                      reservationStore.setEndDate(
                        date,
                        villaStore.selectedVilla!.pricePerNight
                      )
                    }
                    minDate={
                      reservationStore.startDate
                        ? new Date(
                            reservationStore.startDate.getTime() + 86400000
                          )
                        : undefined
                    }
                  />
                )}
                {reservationStore.startDate &&
                  reservationStore.endDate &&
                  reservationStore.totalPrice > 0 && (
                    <Typography variant="body1">
                      Total:{" "}
                      {reservationStore.totalPrice.toLocaleString("bg-BG", {
                        style: "currency",
                        currency: "BGN",
                      })}
                    </Typography>
                  )}
              </Box>
            </LocalizationProvider>
          )}

          <Box
            display="flex"
            gap={2}
            margin={"0 auto"}
            flexDirection={"column"}
          >
            {authStore.isCustomer && (
              <Button
                variant="contained"
                onClick={handleReserve}
                disabled={
                  !reservationStore.startDate ||
                  !reservationStore.endDate ||
                  reservationStore.totalPrice <= 0
                }
              >
                Reserve
              </Button>
            )}
            {authStore.isOwnerOfProperty(villaStore.selectedVilla.ownerId) && (
              <>
                <Button variant="contained" color="primary" onClick={onEdit}>
                  Edit
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => villaStore.openDeletePopUp()}
                >
                  Delete
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Box>

      {authStore.isOwnerOfProperty(villaStore.selectedVilla.ownerId) && (
        <Box margin={"0 auto"} maxWidth={"80vw"}>
          <ReservationTable
            reservations={reservationStore.reservations}
            showActions={false}
          />
          {Boolean(pageCount) && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={pageCount}
                page={reservationStore.pageNumber}
                onChange={(_, page) =>
                  handlePageChange(page, reservationStore.pageSize)
                }
                color="primary"
              />
            </Box>
          )}
        </Box>
      )}

      <Dialog
        open={villaStore.deletePopUpOpen}
        onClose={() => villaStore.closeDeletePopUp()}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Villa</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete "{villaStore.selectedVilla?.name}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => villaStore.closeDeletePopUp()} color="primary">
            Cancel
          </Button>
          <Button onClick={onDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <AlertNotification
        isOpen={villaStore.error !== null}
        onClose={() => villaStore.clearError()}
        message={villaStore.error ?? ""}
      />

      <AlertNotification
        isOpen={reservationStore.error !== null}
        onClose={() => reservationStore.clearError()}
        message={reservationStore.error ?? ""}
      />
    </>
  );
});
