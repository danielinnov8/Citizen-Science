import * as React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { LogoIcon } from "@/components/Logo";

/**
 * AdminRoute — gates a page behind superadmin access. Non-admins (and guests)
 * are bounced to the dashboard. This is a UX guard only; every /api/admin/*
 * endpoint independently enforces the superadmin allowlist server-side.
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();

  const isSuperAdmin = !!user?.isSuperAdmin;

  React.useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      setLocation("/login");
    } else if (!isSuperAdmin) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, isLoading, isSuperAdmin, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#F8FAFC] flex items-center justify-center">
        <LogoIcon className="h-10 w-10 animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated || !isSuperAdmin) return null;

  return <>{children}</>;
}
