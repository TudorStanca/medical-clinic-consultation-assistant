import { useCallback } from "react";
import useApiClient from "@/core/useApiClient";
import type { UpdateProfileRequestDTO, UpdateProfileResponseDTO, DoctorStatsResponseDTO } from "@/profile/props";

const profileUrl = "/api/auth/profile";
const doctorUrl = "/api/Doctor";

const useProfileApi = () => {
  const { axios } = useApiClient();

  const updateProfile = useCallback(
    async (dto: UpdateProfileRequestDTO): Promise<UpdateProfileResponseDTO> => {
      const res = await axios.put<UpdateProfileResponseDTO>(profileUrl, dto);

      return res.data;
    },
    [axios]
  );

  const getDoctorStats = useCallback(async (): Promise<DoctorStatsResponseDTO> => {
    const res = await axios.get<DoctorStatsResponseDTO>(`${doctorUrl}/me/stats`);

    return res.data;
  }, [axios]);

  const getDoctorStatsById = useCallback(async (id: string): Promise<DoctorStatsResponseDTO> => {
    const res = await axios.get<DoctorStatsResponseDTO>(`${doctorUrl}/${id}/stats`);

    return res.data;
  }, [axios]);

  return { updateProfile, getDoctorStats, getDoctorStatsById };
};

export default useProfileApi;
