import { useCallback } from "react";
import useApiClient from "@/core/useApiClient";
import type { ChangePasswordRequestDTO, ResetPasswordDTO } from "@/auth/props";

const authUrl = "/api/auth";

const useAuthApi = () => {
  const { axios } = useApiClient();

  const changePassword = useCallback(
    async (dto: ChangePasswordRequestDTO): Promise<void> => {
      await axios.put(`${authUrl}/change-password`, dto);
    },
    [axios]
  );

  const resetUserPassword = useCallback(
    async (targetUserId: string, dto: ResetPasswordDTO): Promise<void> => {
      await axios.put(`${authUrl}/users/${targetUserId}/reset-password`, dto);
    },
    [axios]
  );

  return { changePassword, resetUserPassword };
};

export default useAuthApi;
