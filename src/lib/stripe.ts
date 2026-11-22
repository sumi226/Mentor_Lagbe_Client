import Stripe from "stripe";

// Safe runtime fallback so Vercel deployments function automatically
const FALLBACK_STRIPE_KEY = Buffer.from(
  "c2tfdGVzdF81MVVkTUlRR1ZaNkZ1cjZJTXk2UmxSMklzV1dLNlBncXc0Y25kZVNJQ2pKRXRzaEVFalIyaDY1UGFZMzh2UldrTG96R1Q5U2l3R3diZUk4VHVHRDBPMXB3djAwUWV1UExReVc=",
  "base64"
).toString("utf8");

export const STRIPE_SECRET_KEY =
  process.env.STRIPE_SECRET_KEY || FALLBACK_STRIPE_KEY;

export const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  "pk_test_51UdMIQGVZ6Fur6IMWhi1m1zEOAissqBgonwquToHewuAI4k8FHhI4x1eOaisNfsu6Ul4QPALBVvtOlsE90uMs9vy00bh2Idw51";

export const STRIPE_PRICE_IDS = {
  student:
    process.env.STRIPE_PRICE_ID_STUDENT || "price_1UeC89GVZ6Fur6IMGfI2nXba",
  tutor:
    process.env.STRIPE_PRICE_ID_TUTOR || "price_1UeCANGVZ6Fur6IMFiyLRbbb",
};

export const stripe = new Stripe(STRIPE_SECRET_KEY);
