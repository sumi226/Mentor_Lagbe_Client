import { client, db } from "@/lib/mongodb";

/** The fields the featured grid renders, flattened and JSON-safe. */
export type FeaturedTuition = {
  id: string;
  title: string;
  subject: string;
  classLevel: string;
  mode: string;
  monthlyFee: number;
  tutorName: string;
};

/**
 * Latest approved & active tuition listings for the home page.
 * Returns [] on any failure so the UI can degrade to an empty state
 * instead of breaking the build or the render.
 */
export async function getFeaturedTuitions(
  limit = 6
): Promise<FeaturedTuition[]> {
  try {
    await client.connect();

    const docs = await db
      .collection("tuitions")
      .find({ approvalStatus: "approved", isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return docs.map((doc) => ({
      id: String(doc._id),
      title: String(doc.title ?? ""),
      subject: String(doc.subject ?? ""),
      classLevel: String(doc.classLevel ?? ""),
      mode: String(doc.mode ?? ""),
      monthlyFee: Number(doc.monthlyFee ?? 0),
      tutorName: String(doc.tutorName ?? ""),
    }));
  } catch (error) {
    console.error("[featured-tuitions] failed to load listings:", error);
    return [];
  }
}
