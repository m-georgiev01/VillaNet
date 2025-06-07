import { Footer } from "./Footer";
import { Header } from "./Header";
import { Main } from "./Main";
import { Box } from "@mui/material";

export const Layout: React.FC = () => (
  <Box
    sx={{
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      backgroundColor: "#F3F4F6",
    }}
  >
    <Header />
    <Main />
    <Footer />
  </Box>
);
