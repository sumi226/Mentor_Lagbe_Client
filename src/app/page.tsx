import FeaturedTuitions from "@/components/featured-tuitions";
import { HeroBanner } from "@/components/hero-banner";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { PricingSection } from "@/components/pricing-section";
import { Reveal } from "@/components/reveal";
import { StatsTestimonials } from "@/components/stats-testimonials";

// Re-render the home page every 60s so newly approved tuitions show up
// without waiting for a full rebuild.
export const revalidate = 60;

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col">
      <HeroBanner />
      <FeaturedTuitions />
      <Reveal>
        <HowItWorksSection />
      </Reveal>
      <Reveal>
        <StatsTestimonials />
      </Reveal>
      <Reveal>
        <PricingSection />
      </Reveal>
    </div>
  );
}
