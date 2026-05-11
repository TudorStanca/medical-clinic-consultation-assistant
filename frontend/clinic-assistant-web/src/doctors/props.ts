export interface DoctorPostDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  specialization: string;
  codParafa: string;
}

export interface DoctorResponseDTO {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  specialization: string;
  codParafa: string;
}
