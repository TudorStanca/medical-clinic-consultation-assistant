export interface LetterAccessGrantResponseDTO {
  id: string;
  granteeDoctorId: string;
  granteeName: string;
  sourceDoctorId: string;
  sourceName: string;
  createdAt: string;
}

export interface LetterAccessGrantPostDTO {
  granteeDoctorId: string;
  sourceDoctorId: string;
}

export interface DoctorSearchableResponseDTO {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
}
