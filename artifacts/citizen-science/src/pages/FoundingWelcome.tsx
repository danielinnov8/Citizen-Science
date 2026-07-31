import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Crown, Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import {
  useGetCheckoutSession,
  getGetCheckoutSessionQueryKey,
} from "@workspace/api-client-react";

/**
 * Landing page after a GUEST founding-member checkout. Stripe redirects here
 * with ?session_id=... — we look up the purchase and route the buyer:
 *   email matches an account → prompt sign-in
 *   no account yet           → prompt sign-up
 *   already claimed          → straight to their profile
 * The membership itself is granted server-side (webhook + claim on auth).
 */
export default function FoundingWelcome() {
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSessionId(params.get("session_id") ?? "");
  }, []);

  const { data, isLoading, isError } = useGetCheckoutSession(sessionId ?? "", {
    query: {
      enabled: Boolean(sessionId),
      queryKey: getGetCheckoutSessionQueryKey(sessionId ?? ""),
      retry: 1,
    },
  });

  const invalidLink = sessionId === "" || isError || (!isLoading && !data);

  const goToAuth = (mode: "signin" | "signup") => {
    try {
      if (data?.email) {
        window.localStorage.setItem("cs.prefillEmail", data.email);
      }
      window.localStorage.setItem("cs.authMode", mode);
      window.localStorage.setItem("cs.postAuthRedirect", "/profile");
    } catch {
      /* ignore */
    }
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-white flex items-center justify-center px-4">
      <div className="pointer-events-none fixed -top-40 left-1/2 h-[460px] w-[700px] -translate-x-1/2 rounded-full bg-amber-500/15 blur-[150px]" />
      <div className="relative w-full max-w-lg text-center">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider"
          style={{
            borderColor: "rgba(212,175,55,0.4)",
            color: "#E4C75B",
            backgroundColor: "rgba(212,175,55,0.08)",
          }}
        >
          <Crown className="h-3.5 w-3.5" />
          Founding Member
        </span>

        {sessionId === null || (Boolean(sessionId) && isLoading) ? (
          <div className="mt-12 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-white/60" />
            <p className="text-white/60">Confirming your payment…</p>
          </div>
        ) : invalidLink || !data ? (
          <div className="mt-10">
            <h1 className="font-serif text-4xl tracking-tight">
              We couldn&apos;t confirm that payment
            </h1>
            <p className="mt-4 text-white/60 leading-relaxed">
              The link may have expired. If you completed a purchase, your
              membership is still recorded — sign up or sign in with the same
              email you used at checkout and it will be applied automatically.
            </p>
            <button
              onClick={() => setLocation("/pricing")}
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 hover:bg-white/5"
            >
              Back to pricing
            </button>
          </div>
        ) : data.claimed ? (
          <div className="mt-10">
            <ShieldCheck
              className="mx-auto h-12 w-12"
              style={{ color: "#E4C75B" }}
            />
            <h1 className="mt-5 font-serif text-4xl tracking-tight">
              Your founding membership is active
            </h1>
            <p className="mt-4 text-white/60 leading-relaxed">
              Everything is already applied to your account ({data.email}).
            </p>
            <button
              onClick={() => setLocation("/profile")}
              className="mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-[#0B1120]"
              style={{
                backgroundImage:
                  "linear-gradient(to bottom right, #F4D77B, #E4C75B 45%, #C9A93B)",
                border: "1px solid #E4C75B",
              }}
            >
              View your profile
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="mt-10">
            <h1 className="font-serif text-4xl lg:text-5xl tracking-tight leading-[1.05]">
              Welcome to the{" "}
              <span className="italic" style={{ color: "#E4C75B" }}>
                founding circle
              </span>
            </h1>
            <p className="mt-5 text-white/70 leading-relaxed">
              Your lifetime membership is confirmed for{" "}
              <span className="text-white font-medium">{data.email}</span>.
              One last step —{" "}
              {data.hasAccount
                ? "sign in with that email and the membership lands on your profile."
                : "create your account with that email and the membership lands on your profile."}
            </p>
            <button
              onClick={() => goToAuth(data.hasAccount ? "signin" : "signup")}
              className="mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-[#0B1120] transition-transform hover:scale-[1.02]"
              style={{
                backgroundImage:
                  "linear-gradient(to bottom right, #F4D77B, #E4C75B 45%, #C9A93B)",
                border: "1px solid #E4C75B",
              }}
              data-testid="founding-claim-cta"
            >
              {data.hasAccount
                ? "Sign in to claim your membership"
                : "Create your account"}
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-4 text-xs text-white/40">
              The email must match the one you used at checkout.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
