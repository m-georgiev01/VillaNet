import { Typography } from "@mui/material";
import { observer } from "mobx-react";
import { useEffect } from "react";
import villaStore from "../../stores/villaStore";
import { VillaContainer } from "../shared/VillasContainer";

export const Home: React.FC = observer(() => {
  useEffect(() => {
    villaStore.resetPagination();
    villaStore.fetchAll(villaStore.pageNumber, villaStore.pageSize);
  }, []);

  if (villaStore.error)
    return <Typography color="error">{villaStore.error}</Typography>;

  const pageCount = Math.ceil(villaStore.totalCount / villaStore.pageSize);

  const handlePageChange = (pageNumber: number, pageSize: number) => {
    villaStore.fetchAll(pageNumber, pageSize);
  };

  return (
    <VillaContainer
      villas={villaStore.villas}
      pageCount={pageCount}
      pageNumber={villaStore.pageNumber}
      onPageChange={handlePageChange}
      pageSize={villaStore.pageSize}
    />
  );
});
