import { observer } from "mobx-react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import villaStore from "../../stores/villaStore";
import locationStore from "../../stores/locationStore";
import { useNavigate } from "react-router";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { lazy, Suspense } from "react";

const DoneIcon = lazy(() => import("@mui/icons-material/Done"));

export const AddVilla: React.FC = observer(() => {
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await villaStore.createVilla();
    if (!villaStore.error) {
      navigate("/");
    }
  };

  return (
    <Box
      component={Paper}
      elevation={3}
      sx={{ maxWidth: 500, mx: "auto", mt: 5, p: 4, borderRadius: 2 }}
    >
      <Typography variant="h5" mb={2}>
        Add Villa
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
          value={villaStore.createVillaRequest.name}
          onChange={(e) => villaStore.setCreateVillaName(e.target.value)}
          required
        />

        <TextField
          label="Price per Night"
          type="number"
          fullWidth
          margin="normal"
          value={
            villaStore.createVillaRequest.pricePerNight === 0
              ? ""
              : villaStore.createVillaRequest.pricePerNight
          }
          onChange={(e) =>
            villaStore.setCreateVillaPrice(Number(e.target.value))
          }
          required
        />

        <TextField
          label="Capacity"
          type="number"
          fullWidth
          margin="normal"
          value={
            villaStore.createVillaRequest.capacity === 0
              ? ""
              : villaStore.createVillaRequest.capacity
          }
          onChange={(e) =>
            villaStore.setCreateVillaCapacity(Number(e.target.value))
          }
          required
        />

        <TextField
          label="Location"
          fullWidth
          margin="normal"
          value={locationStore.query}
          onChange={(e) => locationStore.setQuery(e.target.value)}
          required
          helperText="Type to search for location"
        />

        {locationStore.suggestions.length > 0 && (
          <List
            dense
            sx={{
              border: "1px solid #ccc",
              borderRadius: 1,
              maxHeight: 200,
              overflowY: "auto",
            }}
          >
            {locationStore.suggestions.map((sug, i) => (
              <ListItem disablePadding key={i}>
                <ListItemButton
                  onClick={() => {
                    locationStore.selectSuggestion(sug);
                    villaStore.setCreateVillaLocation(sug.display_name);
                  }}
                >
                  <ListItemText primary={sug.display_name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}

        <TextField
          label="Description"
          multiline
          rows={4}
          fullWidth
          margin="normal"
          value={villaStore.createVillaRequest.description}
          onChange={(e) => villaStore.setCreateVillaDescription(e.target.value)}
          required
        />

        <Box
          display={"flex"}
          justifyContent={"center"}
          gap={2}
          alignItems={"center"}
        >
          <Button variant="contained" component="label" sx={{ mt: 2 }}>
            Upload Image
            <input
              type="file"
              hidden
              required
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  villaStore.setCreateVillaImage(file);
                }
              }}
            />
          </Button>
          {villaStore.createVillaRequest.image ? (
            <Box mt={2}>
              <Suspense fallback={null}>
                <DoneIcon color="success" />
              </Suspense>
            </Box>
          ) : (
            <Typography variant="body2" color="textSecondary" mt={2}>
              No image uploaded
            </Typography>
          )}
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
        >
          Create
        </Button>
      </form>

      <LoadingSpinner showLoading={villaStore.loading} />
    </Box>
  );
});
