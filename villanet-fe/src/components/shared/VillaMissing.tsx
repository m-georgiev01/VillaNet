import { Box, Typography } from "@mui/material";
import ReportGmailerrorredIcon from "@mui/icons-material/ReportGmailerrorred";

export const VillaMissing: React.FC = () => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    textAlign="center"
    m="0 auto"
  >
    <ReportGmailerrorredIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
    <Typography variant="h5" gutterBottom>
      Villa not found
    </Typography>
    <Typography variant="body1" color="text.secondary" mb={3}>
      The villa you are looking for doesn't exist or may have been removed.
    </Typography>
  </Box>
);
