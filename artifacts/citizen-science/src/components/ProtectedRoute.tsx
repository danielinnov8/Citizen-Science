import * as React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hasCompletedOnboarding } = useAuth();
  const [location, setLocation] = useLocation();

  React.useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    } else if (!hasCompletedOnboarding && location !== "/onboarding") {
      setLocation("/onboarding");
    }
  }, [isAuthenticated, hasCompletedOnboarding, location, setLocation]);

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
