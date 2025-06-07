import { Box, Pagination } from "@mui/material";
import type { Villa } from "../../common/models";
import { observer } from "mobx-react";
import { VillaCard } from "./VillaCard";

interface VillaContainerProps {
  villas: Villa[];
  pageCount: number;
  pageNumber: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
}

export const VillaContainer: React.FC<VillaContainerProps> = observer(
  ({ villas, pageCount, pageNumber, pageSize, onPageChange }) => {
    return (
      <Box>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            p: 2,
          }}
        >
          {villas.map((villa) => (
            <VillaCard key={villa.id} villa={villa} />
          ))}
        </Box>

        {Boolean(pageCount) && (
          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination
              count={pageCount}
              page={pageNumber}
              onChange={(_, page) => onPageChange(page, pageSize)}
              color="primary"
            />
          </Box>
        )}
      </Box>
    );
  }
);
