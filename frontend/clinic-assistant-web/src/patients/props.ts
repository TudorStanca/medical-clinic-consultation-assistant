import type { SexValue } from "@/shared/types/enums";

export interface PatientPostDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  identityNumber: string;
  address: string;
  birthDate: string;
  sex: SexValue;
}

export interface PatientResponseDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  identityNumber: string;
  address: string;
  birthDate: string;
  sex: SexValue;
}
