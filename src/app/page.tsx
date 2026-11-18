import FeaturedTuitions from "@/components/featured-tuitions";
import { HeroBanner } from "@/components/hero-banner";

// Re-render the home page every 60s so newly approved tuitions show up
// without waiting for a full rebuild.
export const revalidate = 60;

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col">
      <HeroBanner />
      <FeaturedTuitions />
    </div>
  );
}
