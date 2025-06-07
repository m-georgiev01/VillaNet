import { Typography } from "@mui/material";
import { observer } from "mobx-react";
import { useEffect } from "react";
import villaStore from "../../stores/villaStore";
import { VillaContainer } from "../shared/VillasContainer";

export const OwnerProperties: React.FC = observer(() => {
  useEffect(() => {
    villaStore.resetPagination();
    villaStore.fetchVillasForOwner(villaStore.pageNumber, villaStore.pageSize);
  }, []);

  if (villaStore.error)
    return <Typography color="error">{villaStore.error}</Typography>;

  const pageCount = Math.ceil(villaStore.totalCount / villaStore.pageSize);

  const handlePageChange = (pageNumber: number, pageSize: number) => {
    villaStore.fetchVillasForOwner(pageNumber, pageSize);
  };

  return (
    <>
      {villaStore.villas.length === 0 ? (
        <Typography variant="h6" color="textSecondary" align="center" mt={4}>
          You have no villas listed.
        </Typography>
      ) : (
        <VillaContainer
          villas={villaStore.villas}
          pageCount={pageCount}
          pageNumber={villaStore.pageNumber}
          onPageChange={handlePageChange}
          pageSize={villaStore.pageSize}
        />
      )}
    </>
  );
});
