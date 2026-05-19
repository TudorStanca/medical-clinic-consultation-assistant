import { createContext, useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/core/api";
import { decodeToken, isTokenExpired } from "@/core/jwt";
import type { AuthUser, LoginRequestDTO } from "@/auth/props";

const TOKEN_KEY = "clinic.token";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  initializing: boolean;
  login: (dto: LoginRequestDTO) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  refreshToken: (raw: string) => void;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isAuthenticated: false,
  initializing: true,
  login: async () => {},
  logout: () => {},
  hasRole: () => false,
  refreshToken: () => {},
});

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);
  const interceptorsRef = useRef<{ request: number; response: number } | null>(null);

  const applyToken = useCallback((raw: string) => {
    const decoded = decodeToken(raw);
    if (!decoded || isTokenExpired(decoded)) {
      localStorage.removeItem(TOKEN_KEY);
      return;
    }
    setToken(raw);
    setUser({
      id: decoded.userId,
      email: decoded.email,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      roles: decoded.roles,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) {
      applyToken(saved);
    }
    setInitializing(false);
  }, [applyToken]);

  useEffect(() => {
    if (interceptorsRef.current) {
      apiClient.interceptors.request.eject(interceptorsRef.current.request);
      apiClient.interceptors.response.eject(interceptorsRef.current.response);
    }

    const reqId = apiClient.interceptors.request.use((config) => {
      const raw = localStorage.getItem(TOKEN_KEY);
      if (raw) {
        config.headers["Authorization"] = `Bearer ${raw}`;
      }
      return config;
    });

    const resId = apiClient.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401 && err.config?.url !== "/api/auth/login") {
          logout();
        }
        return Promise.reject(err);
      }
    );

    interceptorsRef.current = { request: reqId, response: resId };
  }, [logout]);

  const login = useCallback(
    async (dto: LoginRequestDTO) => {
      const res = await apiClient.post<{ token: string }>("/api/auth/login", dto);
      const raw = res.data.token;
      localStorage.setItem(TOKEN_KEY, raw);
      applyToken(raw);
      navigate("/");
    },
    [applyToken, navigate]
  );

  const hasRole = useCallback((role: string) => user?.roles.includes(role) ?? false, [user]);

  const refreshToken = useCallback(
    (raw: string) => {
      localStorage.setItem(TOKEN_KEY, raw);
      applyToken(raw);
    },
    [applyToken]
  );

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, initializing, login, logout, hasRole, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}
