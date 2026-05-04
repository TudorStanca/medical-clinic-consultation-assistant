import { useState } from "react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import useAuth from "@/auth/useAuth";
import { Roles } from "@/shared/types/enums";
import PersonalInfoTab from "@/profile/components/PersonalInfoTab";
import DoctorStatsTab from "@/profile/components/DoctorStatsTab";
import SecurityTab from "@/profile/components/SecurityTab";

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
    {value === index && children}
  </Box>
);

const ProfilePage = () => {
  const { user, hasRole } = useAuth();
  const [tab, setTab] = useState(0);

  const showStats = hasRole(Roles.Doctor);
  const showSecurity = !hasRole(Roles.Admin);

  const tabs = [
    { label: "Date personale", component: <PersonalInfoTab /> },
    ...(showStats ? [{ label: "Statistici", component: <DoctorStatsTab /> }] : []),
    ...(showSecurity ? [{ label: "Securitate", component: <SecurityTab /> }] : []),
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Profilul meu — {user?.firstName} {user?.lastName}
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          {tabs.map((t) => (
            <Tab key={t.label} label={t.label} />
          ))}
        </Tabs>
      </Box>
      {tabs.map((t, i) => (
        <TabPanel key={t.label} value={tab} index={i}>
          {t.component}
        </TabPanel>
      ))}
    </Box>
  );
};

export default ProfilePage;
