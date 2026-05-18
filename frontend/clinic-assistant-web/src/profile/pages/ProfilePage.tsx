import { useEffect, useState } from "react";
import { Avatar, Box, Chip, Tab, Tabs, Typography } from "@mui/material";
import useAuth from "@/auth/useAuth";
import { Roles } from "@/shared/types/enums";
import PersonalInfoTab from "@/profile/components/PersonalInfoTab";
import DoctorStatsTab from "@/profile/components/DoctorStatsTab";
import SecurityTab from "@/profile/components/SecurityTab";
import { MS_LIGHT, MS_FONTS } from "@/theme/tokens";
import { usePageHeader } from "@/shared/PageHeaderContext";

const T = MS_LIGHT;

const cardSx = {
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: "14px",
  p: "20px",
} as const;

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ pt: "16px" }}>
    {value === index && (
      <Box
        sx={{
          background: MS_LIGHT.surface,
          border: `1px solid ${MS_LIGHT.border}`,
          borderRadius: "14px",
          p: { xs: "24px 20px", md: "32px 40px" },
        }}
      >
        {children}
      </Box>
    )}
  </Box>
);

const ProfilePage = () => {
  const { user, hasRole } = useAuth();
  const { setHeader } = usePageHeader();
  const [tab, setTab] = useState(0);

  const showStats = hasRole(Roles.Doctor);
  const showSecurity = !hasRole(Roles.Admin);

  useEffect(() => {
    setHeader({ title: "Profilul meu", subtitle: "Gestionare date personale și securitate" });
    return () => setHeader({ title: "" });
  }, [setHeader]);

  const tabs = [
    { label: "Date personale", component: <PersonalInfoTab /> },
    ...(showStats ? [{ label: "Statistici", component: <DoctorStatsTab /> }] : []),
    ...(showSecurity ? [{ label: "Securitate", component: <SecurityTab /> }] : []),
  ];

  const initials = user
    ? `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase()
    : "?";

  const roleLabel = hasRole(Roles.Doctor)
    ? "Doctor"
    : hasRole(Roles.Admin)
    ? "Administrator"
    : "Pacient";

  return (
    <Box>
      {/* Profile header */}
      <Box
        sx={{
          ...cardSx,
          display: "flex",
          alignItems: "center",
          gap: "20px",
          mb: "20px",
          flexWrap: "wrap",
        }}
      >
        <Avatar
          sx={{
            width: 72,
            height: 72,
            bgcolor: T.accentSoft,
            color: T.accentInk,
            fontSize: "1.625rem",
            fontWeight: 600,
            fontFamily: MS_FONTS.sans,
            flexShrink: 0,
          }}
        >
          {initials}
        </Avatar>
        <Box>
          <Typography
            sx={{
              fontSize: "1.25rem",
              fontWeight: 600,
              color: T.text,
              fontFamily: MS_FONTS.sans,
              letterSpacing: "-0.2px",
            }}
          >
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography sx={{ fontSize: "0.8125rem", color: T.textMuted, mt: "2px" }}>
            {user?.email}
          </Typography>
          <Chip label={roleLabel} size="small" color="primary" sx={{ mt: "8px" }} />
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: "0px" }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          {tabs.map((t) => (
            <Tab key={t.label} label={t.label} />
          ))}
        </Tabs>
      </Box>

      {/* Tab panels */}
      {tabs.map((t, i) => (
        <TabPanel key={t.label} value={tab} index={i}>
          {t.component}
        </TabPanel>
      ))}
    </Box>
  );
};

export default ProfilePage;
