import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import useAuth from "@/auth/useAuth";
import { NAV_ITEMS } from "@/layout/NavItems";

const DRAWER_WIDTH = 220;

const AppLayout = () => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.some(hasRole));

  const drawerContent = (
    <Box sx={{ width: DRAWER_WIDTH }}>
      <Toolbar />
      <Divider />
      <List>
        {visibleItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              onClick={() => setDrawerOpen(false)}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            sx={{ mr: 2, display: { sm: "none" } }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Asistent Consultații
          </Typography>
          {user && (
            <Typography variant="body2" sx={{ mr: 2 }}>
              {user.firstName} {user.lastName} ({user.roles.join(", ")})
            </Typography>
          )}
          <IconButton color="inherit" onClick={logout} title="Deconectare">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ display: { xs: "block", sm: "none" }, "& .MuiDrawer-paper": { width: DRAWER_WIDTH } }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, minWidth: 0 }}>
        <Toolbar />
        <Container maxWidth="lg" disableGutters>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default AppLayout;
