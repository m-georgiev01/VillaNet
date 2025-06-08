import { Backdrop, CircularProgress } from "@mui/material";
import { observer } from "mobx-react";

interface LoadingSpinnerProps {
  showLoading: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = observer(
  ({ showLoading }) => (
    <Backdrop
      sx={{
        position: "absolute",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        color: "#fff",
      }}
      open={showLoading}
      data-testid="loading-spinner"
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  )
);
