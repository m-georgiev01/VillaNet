import { observer } from "mobx-react";
import { useNavigate, useParams } from "react-router";
import villaStore from "../../stores/villaStore";
import { useEffect } from "react";
import { VillaMissing } from "../shared/VillaMissing";
import {
  Alert,
  Box,
  Button,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { LoadingSpinner } from "../shared/LoadingSpinner";

export const EditVilla: React.FC = observer(() => {
  const villaId = Number(useParams().id);
  const navigate = useNavigate();

  const fetchVilla = async () => {
    if (isNaN(villaId)) return;

    await villaStore.getVillaById(villaId);
  };

  useEffect(() => {
    fetchVilla();
  }, []);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    await villaStore.updateVilla();

    if (villaStore.selectedVilla) {
      navigate(`/villas/${villaStore.selectedVilla.id}`);
    }
  };

  if (!villaStore.selectedVilla) {
    return <VillaMissing />;
  }

  return (
    <Box
      component={Paper}
      elevation={3}
      sx={{ maxWidth: 400, mx: "auto", mt: 5, p: 4, borderRadius: 2 }}
    >
      <Typography variant="h5" mb={2}>
        Edit
      </Typography>

      {villaStore.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {villaStore.error}
        </Alert>
      )}

      <form onSubmit={onSubmit}>
        <TextField
          label="Name"
          fullWidth
          margin="normal"
          value={villaStore.selectedVilla.name}
          onChange={(e) => villaStore.setSelectedVillaName(e.target.value)}
          required
        />

        <TextField
          label="Price per Night"
          type="number"
          fullWidth
          margin="normal"
          value={villaStore.selectedVilla.pricePerNight}
          onChange={(e) =>
            villaStore.setSelectedVillaPricePerNight(Number(e.target.value))
          }
          required
        />

        <TextField
          sx={{ mt: 2 }}
          label="Description"
          multiline
          rows={4}
          fullWidth
          value={villaStore.selectedVilla.description}
          onChange={(e) =>
            villaStore.setSelectedVillaDescription(e.target.value)
          }
          placeholder="Enter villa's description here..."
          required
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          Save
        </Button>
      </form>

      <LoadingSpinner showLoading={villaStore.loading} />
    </Box>
  );
});
