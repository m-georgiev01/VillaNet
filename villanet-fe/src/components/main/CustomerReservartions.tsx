import { observer } from "mobx-react";
import { useEffect } from "react";
import reservationStore from "../../stores/reservationStore";
import { ReservationTable } from "../shared/ReservationTable";
import { Box, Pagination } from "@mui/material";

export const CustomerReservations: React.FC = observer(() => {
  useEffect(() => {
    reservationStore.restorePagination();
    reservationStore.getReservationsForCustomer();
  }, []);

  const pageCount = Math.ceil(
    reservationStore.totalCount / reservationStore.pageSize
  );

  const handlePageChange = (pageNumber: number, pageSize: number) => {
    reservationStore.getReservationsForCustomer(pageNumber, pageSize);
  };

  const onCancel = async (reservationId: number) => {
    await reservationStore.cancelReservation(reservationId);
    if (!reservationStore.error) {
      reservationStore.closeDeletePopUp();
      reservationStore.getReservationsForCustomer();
    }
  };

  return (
    <Box margin={"0 auto"} maxWidth={"80vw"}>
      <ReservationTable
        reservations={reservationStore.reservations}
        showActions={true}
        cancelIsDisabled={reservationStore.possibleToCancel}
        onCancel={onCancel}
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
  );
});
