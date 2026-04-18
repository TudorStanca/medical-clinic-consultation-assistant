export const Sex = { Male: 0, Female: 1, Other: 2 } as const;
export type SexValue = (typeof Sex)[keyof typeof Sex];

export const DocumentType = {
  Analiza: 0,
  ScrisoareVeche: 1,
  Investigatie: 2,
  Altul: 3,
} as const;
export type DocumentTypeValue = (typeof DocumentType)[keyof typeof DocumentType];

export const SessionStatus = {
  Created: 0,
  Recording: 1,
  Processing: 2,
  Done: 3,
  Failed: 4,
} as const;
export type SessionStatusName = "Created" | "Recording" | "Processing" | "Done" | "Failed";

export const Roles = {
  Doctor: "Doctor",
  Patient: "Patient",
  Admin: "Admin",
} as const;
export type Role = (typeof Roles)[keyof typeof Roles];

export const DocumentTypeLabels: Record<DocumentTypeValue, string> = {
  0: "Analiză",
  1: "Scrisoare veche",
  2: "Investigație",
  3: "Altul",
};

export const SexLabels: Record<SexValue, string> = {
  0: "Masculin",
  1: "Feminin",
  2: "Altul",
};
