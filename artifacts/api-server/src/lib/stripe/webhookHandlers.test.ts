import { describe, it, expect } from "vitest";
import {
  summarizeCheckoutLineItems,
  type CheckoutLineItem,
} from "./webhookHandlers";

// Helpers to build line items that mirror the shape Stripe returns from
// checkout.sessions.listLineItems with expand: ["data.price.product"].
function topupItem(credits: number, quantity = 1): CheckoutLineItem {
  return {
    quantity,
    price: {
      metadata: { type: "topup", creditAmount: String(credits) },
      product: { metadata: {} },
    },
  };
}

function foundingItem(planId = "researcher"): CheckoutLineItem {
  return {
    quantity: 1,
    price: {
      metadata: { type: "founding", planId },
      product: { metadata: {} },
    },
  };
}

describe("summarizeCheckoutLineItems — credit math", () => {
  it("grants exactly the pack's credits (not double) for a single top-up", () => {
    const result = summarizeCheckoutLineItems([topupItem(500)]);
    expect(result.totalCredits).toBe(500);
    expect(result.purchasedPlanId).toBeNull();
  });

  it("grants each of the three packs exactly once", () => {
    expect(summarizeCheckoutLineItems([topupItem(1500)]).totalCredits).toBe(
      1500,
    );
    expect(summarizeCheckoutLineItems([topupItem(5000)]).totalCredits).toBe(
      5000,
    );
  });

  it("multiplies credits by quantity", () => {
    expect(summarizeCheckoutLineItems([topupItem(500, 3)]).totalCredits).toBe(
      1500,
    );
  });

  it("sums multiple distinct packs in one session", () => {
    const result = summarizeCheckoutLineItems([
      topupItem(500),
      topupItem(1500),
    ]);
    expect(result.totalCredits).toBe(2000);
  });

  it("reads creditAmount from product metadata as a fallback", () => {
    const item: CheckoutLineItem = {
      quantity: 1,
      price: {
        metadata: { type: "topup" },
        product: { metadata: { creditAmount: "500" } },
      },
    };
    expect(summarizeCheckoutLineItems([item]).totalCredits).toBe(500);
  });
});

describe("summarizeCheckoutLineItems — founding member", () => {
  it("sets the lifetime plan and grants no credits", () => {
    const result = summarizeCheckoutLineItems([foundingItem("researcher")]);
    expect(result.purchasedPlanId).toBe("researcher");
    expect(result.totalCredits).toBe(0);
  });

  it("does not let a founding item leak into the credit total", () => {
    const result = summarizeCheckoutLineItems([
      foundingItem("researcher"),
      topupItem(500),
    ]);
    expect(result.purchasedPlanId).toBe("researcher");
    expect(result.totalCredits).toBe(500);
  });
});

describe("summarizeCheckoutLineItems — purity / idempotency", () => {
  it("is side-effect free: repeated calls return identical results", () => {
    const items = [topupItem(500), foundingItem("researcher")];
    const first = summarizeCheckoutLineItems(items);
    const second = summarizeCheckoutLineItems(items);
    expect(second).toEqual(first);
    // Re-running must not accumulate state across calls.
    expect(second.totalCredits).toBe(500);
  });

  it("returns zero credits and no plan for an empty session", () => {
    expect(summarizeCheckoutLineItems([])).toEqual({
      totalCredits: 0,
      purchasedPlanId: null,
    });
  });
});
