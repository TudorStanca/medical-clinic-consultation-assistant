import { useCallback } from "react";
import useApiClient from "@/core/useApiClient";
import type { DoctorPostDTO, DoctorResponseDTO } from "@/doctors/props";
import type { PagedQuery, PagedResponse } from "@/shared/types/api";

const doctorUrl = "/api/Doctor";

const useDoctorApi = () => {
  const { axios } = useApiClient();

  const createDoctor = useCallback(
    async (dto: DoctorPostDTO): Promise<DoctorResponseDTO> => {
      const res = await axios.post<DoctorResponseDTO>(doctorUrl, dto);

      return res.data;
    },
    [axios]
  );

  const getDoctorById = useCallback(
    async (id: string): Promise<DoctorResponseDTO> => {
      const res = await axios.get<DoctorResponseDTO>(`${doctorUrl}/${id}`);

      return res.data;
    },
    [axios]
  );

  const getDoctorsPaged = useCallback(
    async (query: PagedQuery): Promise<PagedResponse<DoctorResponseDTO>> => {
      const res = await axios.get<PagedResponse<DoctorResponseDTO>>(doctorUrl, { params: query });

      return res.data;
    },
    [axios]
  );

  return { createDoctor, getDoctorById, getDoctorsPaged };
};

export default useDoctorApi;
