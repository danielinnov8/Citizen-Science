import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useJoinLegendWaitlist,
  getGetLegendWaitlistQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";

// Shared "become a mentee" action for living-legend surfaces (mentor cards +
// the figure hero). Signed-in members join the demand waitlist (best-effort)
// and are dropped into the figure-scoped digital-mentor chat; guests are sent
// to /login with a redirect back to the mentor chat afterwards.
export function useMentorCta() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const join = useJoinLegendWaitlist();

  function startMentorship(slug: string) {
    if (!isAuthenticated) {
      try {
        window.localStorage.setItem("cs.postAuthRedirect", `/mentor/${slug}`);
      } catch {
        /* ignore */
      }
      navigate("/login");
      return;
    }

    // Surface mentee demand to the figure/owner. We navigate to the chat
    // regardless of whether the join succeeds — joining is a side effect, not a
    // gate on the experience.
    join.mutate(
      { slug },
      {
        onSettled: () => {
          void queryClient.invalidateQueries({
            queryKey: getGetLegendWaitlistQueryKey(slug),
          });
        },
      },
    );
    navigate(`/mentor/${slug}`);
  }

  return { startMentorship, isJoining: join.isPending };
}
