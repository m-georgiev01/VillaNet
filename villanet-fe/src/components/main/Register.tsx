import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { observer } from "mobx-react";
import authStore from "../../stores/authStore";
import { useNavigate } from "react-router";
import { runInAction } from "mobx";
import { roles } from "../../common/models";
import { LoadingSpinner } from "../shared/LoadingSpinner";

export const Register: React.FC = observer(() => {
  const navigate = useNavigate();

  const onSubmit = async (e: any) => {
    e.preventDefault();
    await authStore.register(
      authStore.email,
      authStore.username,
      authStore.password,
      authStore.roleId
    );

    if (authStore.isAuthenticated) {
      navigate("/");
    }
  };
  return (
    <Box
      component={Paper}
      elevation={3}
      sx={{ maxWidth: 400, mx: "auto", mt: 5, p: 4, borderRadius: 2 }}
    >
      <Typography variant="h5" mb={2}>
        Register
      </Typography>

      {authStore.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {authStore.error}
        </Alert>
      )}

      <form onSubmit={onSubmit}>
        <TextField
          size="small"
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
          label="Username"
          size="small"
          fullWidth
          margin="normal"
          value={authStore.username}
          onChange={(e) =>
            runInAction(() => (authStore.username = e.target.value))
          }
          required
        />

        <TextField
          size="small"
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

        <TextField
          size="small"
          label="Role"
          select
          fullWidth
          required
          margin="normal"
          value={authStore.roleId}
          onChange={(e) =>
            runInAction(() => (authStore.roleId = parseInt(e.target.value)))
          }
        >
          {roles.map((role) => (
            <MenuItem key={role.id} value={role.id}>
              {role.name}
            </MenuItem>
          ))}
        </TextField>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          Register
        </Button>
      </form>

      <LoadingSpinner showLoading={authStore.loading} />
    </Box>
  );
});
