import { Box, Typography } from "@mui/material";

export const Footer: React.FC = () => (
  <Box sx={{ py: 2, width: "100%" }} data-testid="footer">
    <Typography variant="body2" color="textSecondary">
      © {new Date().getFullYear()} VillaNet. All rights reserved.
    </Typography>
  </Box>
);
