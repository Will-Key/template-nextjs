"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";

type Staff = {
  id: string;
  name: string;
  email: string;
  role: string;
  restaurant: {
    id: string;
    name: string;
    slug: string;
  };
};

type StaffAuthContextType = {
  staff: Staff | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
};

const StaffAuthContext = createContext<StaffAuthContextType | undefined>(undefined);

export function StaffAuthProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const handleUnauthorized = useCallback(() => {
    // Ne pas rediriger si déjà sur la page de login
    if (pathname === "/login" || pathname === "/staff/login") {
      return;
    }
    
    setStaff(null);
    router.push("/login");
  }, [pathname, router]);

  // Fetch authentifié avec gestion automatique des 401
  const authFetch = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
    const response = await fetch(url, {
      ...options,
      credentials: "include",
    });

    if (response.status === 401) {
      handleUnauthorized();
    }

    return response;
  }, [handleUnauthorized]);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch("/api/staff/me", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setStaff(data.staff);
      } else {
        setStaff(null);
        // Ne pas rediriger automatiquement ici, laisser les pages gérer
      }
    } catch (error) {
      console.error("Erreur de vérification auth:", error);
      setStaff(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setStaff(data.staff);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Erreur de login:", error);
      return { success: false, error: "Erreur de connexion" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/staff/logout", { method: "POST" });
      setStaff(null);
    } catch (error) {
      console.error("Erreur de logout:", error);
    }
  };

  return (
    <StaffAuthContext.Provider
      value={{
        staff,
        isLoading,
        isAuthenticated: !!staff,
        login,
        logout,
        checkAuth,
        authFetch,
      }}
    >
      {children}
    </StaffAuthContext.Provider>
  );
}

export function useStaffAuth() {
  const context = useContext(StaffAuthContext);
  if (!context) {
    throw new Error("useStaffAuth must be used within a StaffAuthProvider");
  }
  return context;
}
