import * as React from "react";
import { useLocation } from "wouter";
import { Atom } from "lucide-react";
import { useAuth } from "@/lib/auth";

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
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm animate-pulse">
          <Atom className="h-6 w-6" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
