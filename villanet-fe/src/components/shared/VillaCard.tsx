import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router";
import { ApiBaseUrl, type Villa } from "../../common/models";

interface VillaCardProps {
  villa: Villa;
}

export const VillaCard: React.FC<VillaCardProps> = ({ villa }) => {
  const navigate = useNavigate();
  const handleDetailsClick = () => {
    navigate(`/villas/${villa.id}`);
  };

  return (
    <Card sx={{ width: 300, m: 1, display: "flex", flexDirection: "column" }}>
      <CardMedia
        component="img"
        height="200"
        src={
          villa.image && villa.image.trim() !== ""
            ? `${ApiBaseUrl}/${villa.image}`
            : "https://placehold.co/300x200?text=No+Image"
        }
        alt={villa.name}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6">{villa.name}</Typography>
        <Typography variant="body2" color="textSecondary">
          {villa.location}
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          {villa.pricePerNight.toLocaleString("bg-BG", {
            style: "currency",
            currency: "BGN",
          })}{" "}
          / night
        </Typography>
      </CardContent>
      <Box sx={{ p: 1, textAlign: "center", mb: "10px" }}>
        <Button variant="contained" onClick={handleDetailsClick}>
          View Details
        </Button>
      </Box>
    </Card>
  );
};
