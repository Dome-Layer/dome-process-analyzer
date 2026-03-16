"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { getToken, setToken, clearToken } from "@/lib/auth";
import { deleteSession } from "@/lib/api";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  signIn: (token: string) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  token: null,
  isAuthenticated: false,
  signIn: () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    setTokenState(getToken());
  }, []);

  const signIn = useCallback((newToken: string) => {
    setToken(newToken);
    setTokenState(newToken);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await deleteSession();
    } catch {
      // best-effort
    }
    clearToken();
    setTokenState(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, isAuthenticated: !!token, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
