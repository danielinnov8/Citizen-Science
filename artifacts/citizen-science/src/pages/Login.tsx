import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, AlertCircle } from "lucide-react";
import { LogoIcon } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

const GOOGLE_ERRORS: Record<string, string> = {
  google: "Google sign-in didn't complete. Please try again.",
  google_unconfigured:
    "Google sign-in isn't configured yet. Use email and password for now.",
};

export function Login() {
  const [, setLocation] = useLocation();
  const {
    isAuthenticated,
    isLoading,
    hasCompletedOnboarding,
    signInWithEmail,
    registerWithEmail,
  } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const routeAfterAuth = React.useCallback(() => {
    let pendingPrompt: string | null = null;
    let redirect: string | null = null;
    let pendingCheckout: string | null = null;
    try {
      pendingPrompt = window.localStorage.getItem("cs.pendingPrompt");
      redirect = window.localStorage.getItem("cs.postAuthRedirect");
      pendingCheckout = window.localStorage.getItem("cs.pendingCheckout");
    } catch {
      /* ignore */
    }
    // A pending paid checkout takes precedence over everything else: send the
    // user to /pricing, which resumes the Stripe transaction before onboarding.
    if (pendingCheckout) {
      setLocation("/pricing");
      return;
    }
    // Only honor same-origin internal paths to avoid open-redirects.
    const safeRedirect =
      redirect && /^\/(?!\/)/.test(redirect) ? redirect : null;
    if (!hasCompletedOnboarding) {
      // Keep the redirect flag so onboarding can return the user to it.
      setLocation("/onboarding");
    } else if (safeRedirect) {
      try {
        window.localStorage.removeItem("cs.postAuthRedirect");
      } catch {
        /* ignore */
      }
      setLocation(safeRedirect);
    } else if (pendingPrompt && pendingPrompt.trim().length > 0) {
      setLocation("/agent");
    } else {
      setLocation("/dashboard");
    }
  }, [hasCompletedOnboarding, setLocation]);

  // Pick up Google OAuth error from the callback redirect.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err && GOOGLE_ERRORS[err]) setError(GOOGLE_ERRORS[err]);
  }, []);

  // If already authenticated (incl. returning from Google), route onward.
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      routeAfterAuth();
    }
  }, [isLoading, isAuthenticated, routeAfterAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Enter your email and password.");
      return;
    }
    if (mode === "signup" && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "signup") {
        await registerWithEmail(trimmedEmail, password, name.trim() || undefined);
      } else {
        await signInWithEmail(trimmedEmail, password);
      }
      routeAfterAuth();
    } catch (err) {
      const status = (err as { status?: number }).status;
      if (status === 409) {
        setError("An account with this email already exists. Try signing in.");
      } else if (status === 401) {
        setError("Invalid email or password.");
      } else if (status === 400) {
        setError("Please check your details and try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-2 font-semibold text-xl tracking-tight mb-8">
        <LogoIcon className="h-10 w-10" />
        <span>Citizen Science</span>
      </div>

      <Card className="w-full max-w-md p-8 shadow-lg border-[#E2E8F0]">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-serif tracking-tight mb-2">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-[#64748B] text-sm">
            {mode === "signin"
              ? "Sign in to access your personal science notebook and track your experiments."
              : "Sign up to start running experiments and building your science portfolio."}
          </p>
        </div>

        <Button
          size="lg"
          variant="outline"
          type="button"
          className="w-full mb-5 border-[#E2E8F0] h-12"
          onClick={handleGoogle}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </Button>

        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[#E2E8F0]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-[#94A3B8]">or</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full h-12"
            disabled={submitting}
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <p className="text-center text-sm text-[#64748B] mt-6">
          {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            className="font-medium text-blue-600 hover:underline"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
            }}
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </Card>
    </div>
  );
}
