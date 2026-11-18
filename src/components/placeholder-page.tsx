import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteLogo } from "@/components/site-logo";

/**
 * Temporary page shell for routes that will be built out next.
 * Keeps every navigation target working while the real pages are developed.
 */
export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-28 text-center">
      <SiteLogo className="opacity-80" />
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="max-w-xl text-balance text-muted-foreground">
        {description}
      </p>
      <Button variant="outline" render={<Link href="/" />}>
        Back to Home
      </Button>
    </section>
  );
}
