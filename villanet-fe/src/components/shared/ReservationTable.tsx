import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { Reservation } from "../../common/models";
import { observer } from "mobx-react";
import reservationStore from "../../stores/reservationStore";

interface ReservationTableProps {
  reservations: Reservation[];
  showActions: boolean;
  cancelIsDisabled?: (startDate: Date) => boolean;
  onCancel?: (reservationId: number) => void;
}

export const ReservationTable: React.FC<ReservationTableProps> = observer(
  ({
    reservations,
    showActions = false,
    cancelIsDisabled = () => false,
    onCancel = () => {},
  }) => {
    if (!reservations.length) {
      return (
        <Typography variant="h6" textAlign="center" mt={4}>
          No reservations found.
        </Typography>
      );
    }

    return (
      <Box mt={4}>
        <Typography variant="h5" mb={2}>
          Reservations
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Property</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell align="center">Nights</TableCell>
                <TableCell align="right">Total Price (bgn)</TableCell>
                {showActions && <TableCell align="center">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {reservations.map((res) => (
                <>
                  <TableRow key={res.id}>
                    <TableCell>{res.propertyName}</TableCell>
                    <TableCell>
                      {new Date(res.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(res.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">{res.totalNights}</TableCell>
                    <TableCell align="right">
                      {res.totalPrice.toFixed(2)}
                    </TableCell>
                    {showActions && (
                      <TableCell align="center">
                        {" "}
                        <Button
                          variant="contained"
                          color="error"
                          disabled={cancelIsDisabled(new Date(res.startDate))}
                          onClick={() =>
                            reservationStore.openDeletePopUp(res.id)
                          }
                        >
                          Cancel
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                </>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog
          open={reservationStore.deletePopUpOpen}
          onClose={() => reservationStore.closeDeletePopUp()}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">Cancel Reservarion</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Are you sure you want to cancel the reservation? This action
              cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => reservationStore.closeDeletePopUp()}
              color="primary"
            >
              Keep Reservation
            </Button>
            <Button
              onClick={() => {
                if (reservationStore.reservationIdToDelete) {
                  onCancel(reservationStore.reservationIdToDelete);
                }
                reservationStore.closeDeletePopUp();
              }}
              color="error"
              variant="contained"
            >
              Cancel Reservation
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }
);
