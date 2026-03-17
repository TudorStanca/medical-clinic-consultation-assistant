import axios, { type AxiosInstance } from "axios";
import { useMemo } from "react";

const useApiClient = (): { axios: AxiosInstance } => {
  const instance = useMemo(
    () =>
      axios.create({
        baseURL: "/",
        headers: { "Content-Type": "application/json" },
      }),
    []
  );

  return { axios: instance };
};

export default useApiClient;
