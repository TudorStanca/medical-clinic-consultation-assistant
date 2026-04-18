import { useCallback } from "react";
import useApiClient from "@/core/useApiClient";
import type { DoctorPostDTO, DoctorResponseDTO } from "@/doctors/props";

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

  const getAllDoctors = useCallback(async (): Promise<DoctorResponseDTO[]> => {
    const res = await axios.get<DoctorResponseDTO[]>(doctorUrl);

    return res.data;
  }, [axios]);

  return { createDoctor, getAllDoctors };
};

export default useDoctorApi;
