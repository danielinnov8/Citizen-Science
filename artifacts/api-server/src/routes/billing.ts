import { Router, type IRouter, type Request, type Response } from "express";
import { GetCreditBalanceResponse } from "@workspace/api-zod";
import { resolveBillingSubject } from "../lib/credits/subject";
import { getCreditState, nextRenewalDate } from "../lib/credits/credits";

const router: IRouter = Router();

// Public: report the caller's credit balance. Works for both signed-in users
// and anonymous guests (resolved via the anon cookie), so the copilot UI can
// show a live balance in either case. Fails open with a full-grant view if the
// ledger read errors, so a transient DB hiccup never blanks the meter.
router.get("/billing/credits", async (req: Request, res: Response): Promise<void> => {
  const subject = await resolveBillingSubject(req, res);
  const renewalDate = nextRenewalDate();

  try {
    const state = await getCreditState(subject.subjectKey, subject.monthlyGrant);
    res.json(
      GetCreditBalanceResponse.parse({
        plan: subject.plan,
        isGuest: subject.isGuest,
        monthlyGrant: state.monthlyGrant,
        monthlyRemaining: state.monthlyRemaining,
        topupBalance: state.topupBalance,
        totalRemaining: state.totalRemaining,
        renewalDate,
      }),
    );
  } catch (err) {
    req.log?.warn({ err }, "credit balance read failed; returning full grant");
    res.json(
      GetCreditBalanceResponse.parse({
        plan: subject.plan,
        isGuest: subject.isGuest,
        monthlyGrant: subject.monthlyGrant,
        monthlyRemaining: subject.monthlyGrant,
        topupBalance: 0,
        totalRemaining: subject.monthlyGrant,
        renewalDate,
      }),
    );
  }
});

export default router;
