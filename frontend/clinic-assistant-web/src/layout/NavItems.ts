import type { Role } from "@/shared/types/enums";

export type NavIconId = "home" | "consultations" | "patients" | "doctors" | "profile";

export interface NavItem {
  path: string;
  label: string;
  roles: Role[];
  iconId: NavIconId;
  section: "general" | "account";
}

export const NAV_ITEMS: NavItem[] = [
  { path: "/", label: "Acasă", roles: ["Doctor", "Patient", "Admin"], iconId: "home", section: "general" },
  { path: "/consultations", label: "Consultații", roles: ["Doctor", "Patient", "Admin"], iconId: "consultations", section: "general" },
  { path: "/patients", label: "Pacienți", roles: ["Doctor", "Admin"], iconId: "patients", section: "general" },
  { path: "/doctors", label: "Doctori", roles: ["Admin"], iconId: "doctors", section: "general" },
  { path: "/profile", label: "Profil", roles: ["Doctor", "Patient", "Admin"], iconId: "profile", section: "account" },
];
