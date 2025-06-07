import { Alert, Snackbar } from "@mui/material";
import { observer } from "mobx-react";

interface AlertNotificationProps {
  onClose: () => void;
  isOpen: boolean;
  message: string;
}

export const AlertNotification: React.FC<AlertNotificationProps> = observer(
  ({ isOpen, onClose, message }) => {
    return (
      <Snackbar
        open={isOpen}
        autoHideDuration={1500}
        onClose={onClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={onClose} severity="error" variant="filled">
          {message}
        </Alert>
      </Snackbar>
    );
  }
);
