import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Drawer,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import useAuth from "@/auth/useAuth";
import { useRecording } from "@/consultation/RecordingContext";
import { NAV_ITEMS } from "@/layout/NavItems";
import type { NavIconId } from "@/layout/NavItems";
import MediScribeLogo from "@/shared/components/MediScribeLogo";
import { PageHeaderProvider, usePageHeader } from "@/shared/PageHeaderContext";
import { MS_LIGHT, MS_FONTS } from "@/theme/tokens";

const renderNavIcon = (iconId: NavIconId) => {
  const props = { sx: { fontSize: 18, flexShrink: 0 } } as const;
  switch (iconId) {
    case "home": return <HomeOutlinedIcon {...props} />;
    case "consultations": return <MedicalServicesOutlinedIcon {...props} />;
    case "patients": return <PeopleOutlinedIcon {...props} />;
    case "doctors": return <LocalHospitalOutlinedIcon {...props} />;
    case "profile": return <AccountCircleOutlinedIcon {...props} />;
  }
};

const T = MS_LIGHT;
const SIDEBAR_WIDTH = 232;

const SidebarNavItem = ({
  item,
  active,
  onClick,
}: {
  item: (typeof NAV_ITEMS)[number];
  active: boolean;
  onClick?: () => void;
}) => (
    <Box
      component={Link}
      to={item.path}
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "11px",
        px: "11px",
        py: "9px",
        borderRadius: "9px",
        mx: "10px",
        textDecoration: "none",
        fontSize: "0.875rem",
        fontWeight: active ? 600 : 500,
        fontFamily: MS_FONTS.sans,
        color: active ? T.accentInk : T.textMuted,
        background: active ? T.accentSoft : "transparent",
        transition: "all .15s",
        "&:hover": {
          background: active ? T.accentSoft : T.surfaceAlt,
          color: active ? T.accentInk : T.text,
        },
      }}
    >
      {renderNavIcon(item.iconId)}
      <span>{item.label}</span>
      {active && (
        <Box
          sx={{ marginLeft: "auto", width: 4, height: 16, background: T.accent, borderRadius: "4px", flexShrink: 0 }}
        />
      )}
    </Box>
  );

const SectionLabel = ({ children }: { children: string }) => (
  <Typography
    sx={{
      fontSize: "0.6563rem",
      fontWeight: 600,
      color: T.textDim,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      px: "21px",
      pt: "16px",
      pb: "6px",
    }}
  >
    {children}
  </Typography>
);

const UserCard = ({ onLogout }: { onLogout: () => void }) => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();

  return (
    <Box
      sx={{
        borderTop: `1px solid ${T.border}`,
        p: "12px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: "999px",
          background: T.accentSoft,
          color: T.accentInk,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
          fontSize: "0.8rem",
          fontFamily: MS_FONTS.sans,
          flexShrink: 0,
        }}
      >
        {initials}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: "0.8rem",
            fontWeight: 600,
            color: T.text,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {user.firstName} {user.lastName}
        </Typography>
        <Typography sx={{ fontSize: "0.6875rem", color: T.textDim }}>
          {user.roles[0] ?? ""}
        </Typography>
      </Box>
      <Tooltip title="Deconectare">
        <IconButton size="small" onClick={onLogout} sx={{ flexShrink: 0 }}>
          <LogoutOutlinedIcon sx={{ fontSize: 17 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

const SidebarContent = ({
  onItemClick,
  onLogout,
}: {
  onItemClick?: () => void;
  onLogout: () => void;
}) => {
  const { user } = useAuth();
  const location = useLocation();

  const generalItems = NAV_ITEMS.filter(
    (item) => item.section === "general" && item.roles.some((r) => user?.roles.includes(r))
  );
  const accountItems = NAV_ITEMS.filter(
    (item) => item.section === "account" && item.roles.some((r) => user?.roles.includes(r))
  );

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        component={Link}
        to="/"
        sx={{
          px: "18px",
          py: "20px",
          pb: "14px",
          borderBottom: `1px solid ${T.border}`,
          flexShrink: 0,
          textDecoration: "none",
          display: "block",
          "&:hover": { opacity: 0.8 },
          transition: "opacity .15s",
        }}
      >
        <MediScribeLogo size={26} color={T.text} accent={T.accent} />
      </Box>

      <Box
        sx={{
          flex: 1,
          py: "14px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          overflowY: "auto",
        }}
      >
        <SectionLabel>General</SectionLabel>
        {generalItems.map((item) => (
          <SidebarNavItem key={item.path} item={item} active={isActive(item.path)} onClick={onItemClick} />
        ))}

        <SectionLabel>Cont</SectionLabel>
        {accountItems.map((item) => (
          <SidebarNavItem key={item.path} item={item} active={isActive(item.path)} onClick={onItemClick} />
        ))}
      </Box>

      <UserCard onLogout={onLogout} />
    </Box>
  );
};

const Topbar = ({ onMobileMenuOpen }: { onMobileMenuOpen: () => void }) => {
  const { header } = usePageHeader();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        px: "28px",
        minHeight: 64,
        borderBottom: `1px solid ${T.border}`,
        background: T.surface,
        gap: 2,
        flexShrink: 0,
      }}
    >
      <IconButton
        sx={{ display: { sm: "none" }, mr: 1 }}
        onClick={onMobileMenuOpen}
      >
        <MenuIcon />
      </IconButton>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        {header.breadcrumbs && header.breadcrumbs.length > 0 && (
          <Box sx={{ display: "flex", gap: "6px", alignItems: "center", mb: "3px" }}>
            {header.breadcrumbs.map((crumb, i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {i > 0 && (
                  <Typography sx={{ fontSize: "0.7188rem", color: T.textDim, opacity: 0.5 }}>
                    /
                  </Typography>
                )}
                <Typography
                  sx={{
                    fontSize: "0.7188rem",
                    color: i === header.breadcrumbs!.length - 1 ? T.textMuted : T.textDim,
                  }}
                >
                  {crumb}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
        {header.title ? (
          <Typography
            sx={{
              fontSize: "1.0625rem",
              fontWeight: 600,
              color: T.text,
              letterSpacing: -0.3,
              lineHeight: 1.2,
            }}
          >
            {header.title}
          </Typography>
        ) : (
          <Box
            component={Link}
            to="/"
            sx={{ display: { xs: "flex", sm: "none" }, textDecoration: "none" }}
          >
            <MediScribeLogo size={22} color={T.text} accent={T.accent} />
          </Box>
        )}
        {header.subtitle && (
          <Typography sx={{ fontSize: "0.7813rem", color: T.textMuted, mt: "2px" }}>
            {header.subtitle}
          </Typography>
        )}
      </Box>

      {header.actions && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
          {header.actions}
        </Box>
      )}
    </Box>
  );
};

const AppLayoutInner = () => {
  const { logout } = useAuth();
  const { isActive } = useRecording();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const handleLogoutClick = () => {
    if (isActive) {
      setLogoutConfirmOpen(true);
    } else {
      logout();
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", background: T.bg, overflow: "hidden" }}>
      <Box
        component="aside"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          display: { xs: "none", sm: "flex" },
          flexDirection: "column",
          background: T.surface,
          borderRight: `1px solid ${T.border}`,
          height: "100vh",
        }}
      >
        <SidebarContent onLogout={handleLogoutClick} />
      </Box>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { sm: "none" }, "& .MuiDrawer-paper": { width: SIDEBAR_WIDTH } }}
      >
        <SidebarContent onItemClick={() => setMobileOpen(false)} onLogout={handleLogoutClick} />
      </Drawer>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", overflow: "hidden" }}>
        <Topbar onMobileMenuOpen={() => setMobileOpen(true)} />
        <Box component="main" sx={{ flex: 1, overflow: "auto", p: "24px 28px 32px" }}>
          <Outlet />
        </Box>
      </Box>

      <Dialog open={logoutConfirmOpen} onClose={() => setLogoutConfirmOpen(false)}>
        <DialogTitle>Înregistrare activă</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ești în mijlocul unei înregistrări active. Dacă te deconectezi acum, înregistrarea va fi oprită și datele audio
            înregistrate până acum vor fi procesate. Continui?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutConfirmOpen(false)}>Anulează</Button>
          <Button
            color="error"
            onClick={() => {
              setLogoutConfirmOpen(false);
              logout();
            }}
          >
            Deconectează-te
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const AppLayout = () => (
  <PageHeaderProvider>
    <AppLayoutInner />
  </PageHeaderProvider>
);

export default AppLayout;
