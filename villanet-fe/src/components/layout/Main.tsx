import { Box } from "@mui/material";
import { Outlet } from "react-router";

export const Main: React.FC = () => (
  <Box sx={{ flexGrow: 1 }}>
    <Outlet />
  </Box>
);
