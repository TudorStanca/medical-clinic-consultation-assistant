import type { Role } from "@/shared/types/enums";

export interface NavItem {
  path: string;
  label: string;
  roles: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { path: "/", label: "Dashboard", roles: ["Doctor", "Patient", "Admin"] },
  { path: "/consultations", label: "Consultații", roles: ["Doctor", "Patient", "Admin"] },
  { path: "/patients", label: "Pacienți", roles: ["Doctor", "Admin"] },
  { path: "/doctors", label: "Doctori", roles: ["Admin"] },
];
