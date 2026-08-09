"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import api from "@/lib/api";
import { User } from "@/lib/types";

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, motDePasse: string) => Promise<void>;
  register: (data: {
    nom: string;
    prenom: string;
    email: string;
    motDePasse: string;
    telephone?: string;
    ville?: string;
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("cs_token");
    if (saved) {
      setToken(saved);
      api<User>("/auth/profile", { token: saved })
        .then(setUser)
        .catch(() => {
          localStorage.removeItem("cs_token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email: string, motDePasse: string) {
    const data = await api<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: { email, motDePasse },
    });
    localStorage.setItem("cs_token", data.token);
    setToken(data.token);
    setUser(data.user);
  }

  async function register(payload: {
    nom: string;
    prenom: string;
    email: string;
    motDePasse: string;
    telephone?: string;
    ville?: string;
  }) {
    const data = await api<{ user: User; token: string }>("/auth/register", {
      method: "POST",
      body: payload,
    });
    localStorage.setItem("cs_token", data.token);
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("cs_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé à l'intérieur de <AuthProvider>");
  return ctx;
}
