import {
  Alert,
  Box,
  Button,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { observer } from "mobx-react";
import authStore from "../../stores/authStore";
import { useNavigate } from "react-router";
import { runInAction } from "mobx";
import { LoadingSpinner } from "../shared/LoadingSpinner";

export const Login: React.FC = observer(() => {
  const navigate = useNavigate();

  const onSubmit = async (e: any) => {
    e.preventDefault();
    await authStore.login(authStore.email, authStore.password);

    if (authStore.isAuthenticated) {
      navigate("/");
    }
  };

  return (
    <Box
      component={Paper}
      elevation={3}
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 5,
        p: 4,
        borderRadius: 2,
        maxHeight: "50vh",
      }}
    >
      <Typography variant="h5" mb={2}>
        Login
      </Typography>

      {authStore.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {authStore.error}
        </Alert>
      )}

      <form onSubmit={onSubmit}>
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          value={authStore.email}
          onChange={(e) =>
            runInAction(() => (authStore.email = e.target.value))
          }
          required
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={authStore.password}
          onChange={(e) =>
            runInAction(() => (authStore.password = e.target.value))
          }
          required
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          Login
        </Button>
      </form>

      <LoadingSpinner showLoading={authStore.loading} />
    </Box>
  );
});
