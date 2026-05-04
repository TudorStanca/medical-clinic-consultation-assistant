export interface UpdateProfileRequestDTO {
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
}

export interface UpdateProfileResponseDTO {
  token: string;
}

export interface DoctorStatsResponseDTO {
  consultationCount: number;
  medicalLetterCount: number;
}
