import { useCallback } from "react";
import useApiClient from "@/core/useApiClient";
import type { DoctorSearchableResponseDTO, LetterAccessGrantPostDTO, LetterAccessGrantResponseDTO } from "@/access/props";

const grantsUrl = "/api/LetterAccessGrants";
const doctorsUrl = "/api/Doctor";

const useLetterAccessApi = () => {
  const { axios } = useApiClient();

  const getMyGrants = useCallback(async (): Promise<LetterAccessGrantResponseDTO[]> => {
    const res = await axios.get<LetterAccessGrantResponseDTO[]>(`${grantsUrl}/me`);

    return res.data;
  }, [axios]);

  const createGrant = useCallback(
    async (dto: LetterAccessGrantPostDTO): Promise<LetterAccessGrantResponseDTO> => {
      const res = await axios.post<LetterAccessGrantResponseDTO>(grantsUrl, dto);

      return res.data;
    },
    [axios]
  );

  const revokeGrant = useCallback(
    async (id: string): Promise<void> => {
      await axios.delete(`${grantsUrl}/${id}`);
    },
    [axios]
  );

  const getSourceDoctors = useCallback(async (): Promise<DoctorSearchableResponseDTO[]> => {
    const res = await axios.get<DoctorSearchableResponseDTO[]>(`${grantsUrl}/me/source-doctors`);

    return res.data;
  }, [axios]);

  const getSearchableDoctors = useCallback(
    async (search?: string): Promise<DoctorSearchableResponseDTO[]> => {
      const params = search ? { search } : {};
      const res = await axios.get<DoctorSearchableResponseDTO[]>(`${doctorsUrl}/searchable`, { params });

      return res.data;
    },
    [axios]
  );

  return { getMyGrants, createGrant, revokeGrant, getSourceDoctors, getSearchableDoctors };
};

export default useLetterAccessApi;
