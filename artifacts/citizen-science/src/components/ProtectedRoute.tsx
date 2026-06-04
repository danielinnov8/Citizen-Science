import * as React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { LogoIcon } from "@/components/Logo";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, hasCompletedOnboarding } = useAuth();
  const [location, setLocation] = useLocation();

  React.useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      setLocation("/login");
    } else if (!hasCompletedOnboarding && location !== "/onboarding") {
      setLocation("/onboarding");
    }
  }, [isAuthenticated, isLoading, hasCompletedOnboarding, location, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#F8FAFC] flex items-center justify-center">
        <LogoIcon className="h-10 w-10 animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
