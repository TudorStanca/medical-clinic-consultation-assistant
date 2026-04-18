import { useCallback } from "react";
import useApiClient from "@/core/useApiClient";
import type { PatientPostDTO, PatientResponseDTO } from "@/patients/props";

const patientUrl = "/api/Patient";

const usePatientApi = () => {
  const { axios } = useApiClient();

  const createPatient = useCallback(
    async (dto: PatientPostDTO): Promise<PatientResponseDTO> => {
      const res = await axios.post<PatientResponseDTO>(patientUrl, dto);

      return res.data;
    },
    [axios]
  );

  const getPatientById = useCallback(
    async (id: string): Promise<PatientResponseDTO> => {
      const res = await axios.get<PatientResponseDTO>(`${patientUrl}/${id}`);

      return res.data;
    },
    [axios]
  );

  const getAllPatients = useCallback(async (): Promise<PatientResponseDTO[]> => {
    const res = await axios.get<PatientResponseDTO[]>(patientUrl);

    return res.data;
  }, [axios]);

  return { createPatient, getPatientById, getAllPatients };
};

export default usePatientApi;
