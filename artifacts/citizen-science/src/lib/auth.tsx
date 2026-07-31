import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetCurrentUser,
  useLogin,
  useRegister,
  useLogout,
  getGetCurrentUserQueryKey,
  completeOnboarding as completeOnboardingRequest,
  type AuthUser,
} from "@workspace/api-client-react";

interface AuthUserView {
  id: string;
  name: string;
  email: string;
  initials: string;
  image: string | null;
  isSuperAdmin: boolean;
  isMentor: boolean;
  foundingMember: boolean;
  onboarded: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  user: AuthUserView | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

function computeInitials(name: string | null, email: string): string {
  const source = (name && name.trim()) || email;
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function toView(user: AuthUser): AuthUserView {
  const displayName = (user.name && user.name.trim()) || user.email.split("@")[0];
  return {
    id: user.id,
    name: displayName,
    email: user.email,
    initials: computeInitials(user.name, user.email),
    image: user.image,
    isSuperAdmin: user.isSuperAdmin,
    isMentor: user.isMentor,
    foundingMember: user.foundingMember,
    onboarded: user.onboarded,
  };
}

function readLegacyFlag(): boolean {
  try {
    return localStorage.getItem("cs_onboarded") === "true";
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const meQuery = useGetCurrentUser({
    query: {
      queryKey: getGetCurrentUserQueryKey(),
      retry: false,
      staleTime: 1000 * 60,
    },
  });

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  // Legacy compat: the old wizard stored completion in localStorage only. The
  // server flag (users.onboarded_at, surfaced as `user.onboarded`) is now the
  // source of truth; the local flag keeps pre-migration users from being
  // bounced back into onboarding and is backfilled to the server below.
  const [legacyOnboarded, setLegacyOnboarded] = useState(readLegacyFlag);

  const user = meQuery.data ? toView(meQuery.data) : null;
  const isAuthenticated = !!user;
  const isLoading = meQuery.isLoading;
  const hasCompletedOnboarding = user ? user.onboarded || legacyOnboarded : false;

  // One-shot backfill: a signed-in user with the legacy local flag but no
  // server flag gets their completion persisted server-side. Best-effort.
  const backfillAttempted = useRef(false);
  useEffect(() => {
    if (!user || user.onboarded || !legacyOnboarded) return;
    if (backfillAttempted.current) return;
    backfillAttempted.current = true;
    completeOnboardingRequest({ source: "legacy", path: "member" })
      .then(() => {
        queryClient.setQueryData(
          getGetCurrentUserQueryKey(),
          (prev: AuthUser | null | undefined) =>
            prev ? { ...prev, onboarded: true } : prev,
        );
      })
      .catch(() => {
        // Leave the local flag doing its job; retry next session.
        backfillAttempted.current = false;
      });
  }, [user, legacyOnboarded, queryClient]);

  const signInWithEmail = async (email: string, password: string) => {
    const result = await loginMutation.mutateAsync({ data: { email, password } });
    queryClient.setQueryData(getGetCurrentUserQueryKey(), result);
  };

  const registerWithEmail = async (
    email: string,
    password: string,
    name?: string,
  ) => {
    const result = await registerMutation.mutateAsync({
      data: { email, password, ...(name ? { name } : {}) },
    });
    queryClient.setQueryData(getGetCurrentUserQueryKey(), result);
  };

  const signOut = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      /* ignore — clear local state regardless */
    }
    queryClient.setQueryData(getGetCurrentUserQueryKey(), null);
    await queryClient.invalidateQueries({
      queryKey: getGetCurrentUserQueryKey(),
    });
  };

  // Mark onboarding done locally (optimistic). The Onboarding page persists to
  // the server via POST /onboarding/complete; this keeps the client-side gate
  // open immediately so completion navigation isn't bounced by ProtectedRoute.
  const completeOnboarding = () => {
    try {
      localStorage.setItem("cs_onboarded", "true");
    } catch {
      /* ignore */
    }
    setLegacyOnboarded(true);
    queryClient.setQueryData(
      getGetCurrentUserQueryKey(),
      (prev: AuthUser | null | undefined) =>
        prev ? { ...prev, onboarded: true } : prev,
    );
  };

  // Sync onboarding flag across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cs_onboarded") {
        setLegacyOnboarded(e.newValue === "true");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        hasCompletedOnboarding,
        user,
        signInWithEmail,
        registerWithEmail,
        signOut,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
