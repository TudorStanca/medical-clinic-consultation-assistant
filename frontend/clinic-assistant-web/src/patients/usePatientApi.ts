import { useCallback } from "react";
import useApiClient from "@/core/useApiClient";
import type { PatientPostDTO, PatientResponseDTO } from "@/patients/props";
import type { PagedQuery, PagedResponse } from "@/shared/types/api";

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
    const res = await axios.get<PagedResponse<PatientResponseDTO>>(patientUrl, {
      params: { page: 1, pageSize: 9999 },
    });

    return res.data.items;
  }, [axios]);

  const getPatientsPaged = useCallback(
    async (query: PagedQuery): Promise<PagedResponse<PatientResponseDTO>> => {
      const res = await axios.get<PagedResponse<PatientResponseDTO>>(patientUrl, {
        params: query,
      });

      return res.data;
    },
    [axios]
  );

  return { createPatient, getPatientById, getAllPatients, getPatientsPaged };
};

export default usePatientApi;
