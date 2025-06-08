import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import { observer } from "mobx-react";
import { Link, useNavigate } from "react-router";
import authStore from "../../stores/authStore";

export const Header: React.FC = observer(() => {
  const navigate = useNavigate();

  return (
    <AppBar position="sticky" sx={{ p: "2px 20px" }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ color: "#fff", textDecoration: "none" }}
        >
          VillaNet
        </Typography>

        {!authStore.isAuthenticated ? (
          <Box>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Register
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: "flex", gap: "15px" }}>
            <Box>
              {authStore.isOwner && (
                <>
                  <Button color="inherit" component={Link} to="/villas/add">
                    Add Villa
                  </Button>
                  <Button color="inherit" component={Link} to="/villas/my">
                    Own Villas
                  </Button>
                </>
              )}
              {authStore.isCustomer && (
                <Button color="inherit" component={Link} to="/reservations/my">
                  My Reservations
                </Button>
              )}
            </Box>
            <Box>
              <Button
                color="inherit"
                onClick={() => authStore.logout(navigate)}
              >
                Logout
              </Button>
            </Box>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
});
