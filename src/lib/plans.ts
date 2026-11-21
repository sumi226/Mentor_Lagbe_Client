/** Subscription plan definitions shared by the pricing UI and /api/checkout. */

export type PlanKey = "student" | "tutor";

export type ProPlan = {
  key: PlanKey;
  name: string;
  /** Human-readable price shown in the UI. */
  priceLabel: string;
  /** Stripe amount in the smallest currency unit (e.g. cents). */
  amount: number;
  /** ISO currency code used when no Stripe Price ID is configured. */
  currency: string;
  /** Env var that can override with a real Stripe Price ID. */
  priceIdEnv: string;
  tagline: string;
  features: string[];
};

export const FREE_FEATURES: Record<PlanKey, string[]> = {
  student: [
    "Browse all approved tuition listings",
    "Search & filter by subject, class and budget",
    "Apply to up to 3 tuitions per month",
    "Community support",
  ],
  tutor: [
    "Post up to 2 tuition batches",
    "Appear in search results",
    "Standard admin approval (24–48h)",
    "Community support",
  ],
};

export const PRO_PLANS: Record<PlanKey, ProPlan> = {
  student: {
    key: "student",
    name: "Pro Student",
    priceLabel: "$10.00",
    amount: 1000,
    currency: "usd",
    priceIdEnv: "STRIPE_PRICE_ID_STUDENT",
    tagline: "For students who want priority booking and unlimited access.",
    features: [
      "Priority booking with top tutors",
      "Unlimited tuition applications",
      "Direct priority messaging",
      "Pro student verified badge",
      "24/7 dedicated support",
    ],
  },
  tutor: {
    key: "tutor",
    name: "Pro Tutor",
    priceLabel: "$15.00",
    amount: 1500,
    currency: "usd",
    priceIdEnv: "STRIPE_PRICE_ID_TUTOR",
    tagline: "For tutors who want unlimited posts and verified badge.",
    features: [
      "Unlimited tuition posts (no 2-post limit)",
      "Official Verified Tutor badge",
      "Featured placement on tuition search",
      "Applicant analytics & priority matching",
      "Direct instant student alerts",
    ],
  },
};
