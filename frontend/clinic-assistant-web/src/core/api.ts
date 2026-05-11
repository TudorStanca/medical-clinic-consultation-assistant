import axios from "axios";
import type { AxiosInstance } from "axios";

const apiClient: AxiosInstance = axios.create({
  baseURL: "/",
  headers: { "Content-Type": "application/json" },
});

export default apiClient;
