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
    priceLabel: "$4.99",
    amount: 499,
    currency: "usd",
    priceIdEnv: "STRIPE_PRICE_ID_STUDENT",
    tagline: "For students who want faster, unlimited access.",
    features: [
      "Unlimited tuition applications",
      "Priority responses from tutors",
      "Save & compare favourite tuitions",
      "Direct messaging with tutors",
      "Pro student badge on your profile",
    ],
  },
  tutor: {
    key: "tutor",
    name: "Pro Tutor",
    priceLabel: "$9.99",
    amount: 999,
    currency: "usd",
    priceIdEnv: "STRIPE_PRICE_ID_TUTOR",
    tagline: "For tutors who want more students and visibility.",
    features: [
      "Unlimited tuition batch posts",
      "Featured placement on the home page",
      "Priority admin approval",
      "Applicant analytics dashboard",
      "Pro tutor badge on your profile",
    ],
  },
};
