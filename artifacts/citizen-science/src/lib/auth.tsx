import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthState {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  user: {
    name: string;
    email: string;
    initials: string;
  } | null;
  signIn: () => void;
  signOut: () => void;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem("cs_auth") === "true";
    } catch {
      return false;
    }
  });
  
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    try {
      return localStorage.getItem("cs_onboarded") === "true";
    } catch {
      return false;
    }
  });

  const user = isAuthenticated ? { name: "Daniel Kim", email: "daniel@citizenscience.app", initials: "DK" } : null;

  const signIn = () => {
    try {
      localStorage.setItem("cs_auth", "true");
    } catch {}
    setIsAuthenticated(true);
  };

  const signOut = () => {
    try {
      localStorage.removeItem("cs_auth");
    } catch {}
    setIsAuthenticated(false);
  };

  const completeOnboarding = () => {
    try {
      localStorage.setItem("cs_onboarded", "true");
    } catch {}
    setHasCompletedOnboarding(true);
  };

  // Sync state if it changes in another tab (optional but good practice)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cs_auth") {
        setIsAuthenticated(e.newValue === "true");
      }
      if (e.key === "cs_onboarded") {
        setHasCompletedOnboarding(e.newValue === "true");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, hasCompletedOnboarding, user, signIn, signOut, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
