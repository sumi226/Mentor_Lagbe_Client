import Link from "next/link";
import { BookOpen, Sparkles } from "lucide-react";

import { getFeaturedTuitions } from "@/lib/tuitions";
import { TuitionCard } from "@/components/tuition-card";

export default async function FeaturedTuitions() {
  const tuitions = await getFeaturedTuitions(6);

  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" />
            Featured Tuitions
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Fresh listings, ready to book
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            The latest approved tuition requests from students and parents — updated
            automatically as new requests come in.
          </p>
        </div>

        {tuitions.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
            <BookOpen className="mx-auto size-10 text-muted-foreground/60" />
            <p className="mt-4 font-semibold">No featured tuitions yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Approved and active listings will appear here automatically.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {tuitions.map((item) => (
                <TuitionCard key={item.id} item={item} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/tuitions"
                className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                Browse all tuitions →
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
