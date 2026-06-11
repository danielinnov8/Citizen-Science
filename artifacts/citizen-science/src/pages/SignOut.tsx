import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";

export function SignOut() {
  const { signOut } = useAuth();
  const [, setLocation] = useLocation();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    (async () => {
      try {
        await signOut();
      } finally {
        setLocation("/");
      }
    })();
  }, [signOut, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        <p className="text-muted-foreground">Signing you out…</p>
      </div>
    </div>
  );
}
