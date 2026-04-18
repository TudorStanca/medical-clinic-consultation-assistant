import apiClient from "@/core/api";
import type { AxiosInstance } from "axios";

const useApiClient = (): { axios: AxiosInstance } => {
  return { axios: apiClient };
};

export default useApiClient;
