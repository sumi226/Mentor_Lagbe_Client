import { ObjectId, type Sort } from "mongodb";
import { client, db } from "@/lib/mongodb";

/** Full shape of a tuition document as rendered by the app. */
export type Tuition = {
  id: string;
  title: string;
  subject: string;
  classLevel: string;
  mode: string;
  location: string;
  monthlyFee: number;
  daysPerWeek: number;
  bannerImage: string;
  description: string;
  tutorName: string;
  tutorEmail: string;
  tutorAvatar: string;
  approvalStatus: string;
  isActive: boolean;
  createdAt: string;
};

/** The fields every tuition card renders (used by featured + browse grids). */
export type FeaturedTuition = Pick<
  Tuition,
  | "id"
  | "title"
  | "subject"
  | "classLevel"
  | "mode"
  | "monthlyFee"
  | "tutorName"
> &
  Partial<Pick<Tuition, "daysPerWeek" | "location" | "tutorAvatar">>;

const APPROVED_ACTIVE = { approvalStatus: "approved", isActive: true } as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDoc(doc: any): Tuition {
  return {
    id: String(doc._id),
    title: String(doc.title ?? ""),
    subject: String(doc.subject ?? ""),
    classLevel: String(doc.classLevel ?? ""),
    mode: String(doc.mode ?? ""),
    location: String(doc.location ?? ""),
    monthlyFee: Number(doc.monthlyFee ?? 0),
    daysPerWeek: Number(doc.daysPerWeek ?? 0),
    bannerImage: String(doc.bannerImage ?? ""),
    description: String(doc.description ?? ""),
    tutorName: String(doc.tutorName ?? ""),
    tutorEmail: String(doc.tutorEmail ?? ""),
    tutorAvatar: String(doc.tutorAvatar ?? ""),
    approvalStatus: String(doc.approvalStatus ?? ""),
    isActive: Boolean(doc.isActive),
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : String(doc.createdAt ?? ""),
  };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Latest approved & active tuition listings for the home page. */
export async function getFeaturedTuitions(limit = 6): Promise<Tuition[]> {
  try {
    await client.connect();
    const docs = await db
      .collection("tuitions")
      .find(APPROVED_ACTIVE)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    return docs.map(mapDoc);
  } catch (error) {
    console.error("[tuitions] failed to load featured listings:", error);
    return [];
  }
}

export type TuitionFilters = {
  q?: string;
  subject?: string;
  classLevel?: string;
  mode?: string;
  maxFee?: number;
  sort?: "newest" | "fee-asc" | "fee-desc";
};

/** All approved & active listings for /tuitions, with search + filters. */
export async function getAllTuitions(
  filters: TuitionFilters = {}
): Promise<Tuition[]> {
  try {
    await client.connect();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { ...APPROVED_ACTIVE };

    if (filters.subject) query.subject = filters.subject;
    if (filters.classLevel) query.classLevel = filters.classLevel;
    if (filters.mode) query.mode = filters.mode;
    if (typeof filters.maxFee === "number" && filters.maxFee > 0) {
      query.monthlyFee = { $lte: filters.maxFee };
    }
    if (filters.q) {
      const rx = new RegExp(escapeRegExp(filters.q), "i");
      query.$or = [
        { title: rx },
        { subject: rx },
        { tutorName: rx },
        { description: rx },
        { classLevel: rx },
      ];
    }

    const sort: Sort =
      filters.sort === "fee-asc"
        ? { monthlyFee: 1 }
        : filters.sort === "fee-desc"
          ? { monthlyFee: -1 }
          : { createdAt: -1 };

    const docs = await db
      .collection("tuitions")
      .find(query)
      .sort(sort)
      .limit(60)
      .toArray();
    return docs.map(mapDoc);
  } catch (error) {
    console.error("[tuitions] failed to load listings:", error);
    return [];
  }
}

/** Single approved & active listing, or null (invalid id / not found). */
export async function getTuitionById(id: string): Promise<Tuition | null> {
  try {
    if (!ObjectId.isValid(id)) return null;
    await client.connect();
    const doc = await db.collection("tuitions").findOne({
      _id: new ObjectId(id),
      ...APPROVED_ACTIVE,
    });
    return doc ? mapDoc(doc) : null;
  } catch (error) {
    console.error("[tuitions] failed to load listing:", error);
    return null;
  }
}

/** Other approved listings in the same subject (for the detail page). */
export async function getSimilarTuitions(
  excludeId: string,
  subject: string,
  limit = 3
): Promise<Tuition[]> {
  try {
    await client.connect();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { ...APPROVED_ACTIVE, subject };
    if (ObjectId.isValid(excludeId)) query._id = { $ne: new ObjectId(excludeId) };
    const docs = await db
      .collection("tuitions")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    return docs.map(mapDoc);
  } catch {
    return [];
  }
}

export type TuitionFilterOptions = {
  subjects: string[];
  classLevels: string[];
};

/** Distinct subject / class-level values for the filter dropdowns. */
export async function getTuitionFilterOptions(): Promise<TuitionFilterOptions> {
  try {
    await client.connect();
    const col = db.collection("tuitions");
    const [subjects, classLevels] = await Promise.all([
      col.distinct("subject", APPROVED_ACTIVE),
      col.distinct("classLevel", APPROVED_ACTIVE),
    ]);
    return {
      subjects: subjects.map(String).sort(),
      classLevels: classLevels.map(String).sort(),
    };
  } catch {
    return { subjects: [], classLevels: [] };
  }
}

export type PlatformStats = {
  tuitions: number;
  subjects: number;
  tutors: number;
  online: number;
};

/** Live platform counters for the home page statistics section. */
export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    await client.connect();
    const col = db.collection("tuitions");
    const [tuitions, subjects, tutors, online] = await Promise.all([
      col.countDocuments(APPROVED_ACTIVE),
      col.distinct("subject", APPROVED_ACTIVE),
      col.distinct("tutorEmail", APPROVED_ACTIVE),
      col.countDocuments({ ...APPROVED_ACTIVE, mode: "Online" }),
    ]);
    return {
      tuitions,
      subjects: subjects.length,
      tutors: tutors.length,
      online,
    };
  } catch {
    return { tuitions: 0, subjects: 0, tutors: 0, online: 0 };
  }
}

/** How many live listings each popular subject has. */
export async function getSubjectCounts(
  subjects: string[]
): Promise<Record<string, number>> {
  const zeroed: Record<string, number> = {};
  for (const s of subjects) zeroed[s] = 0;
  try {
    await client.connect();
    const grouped = await db
      .collection("tuitions")
      .aggregate<{ _id: string; count: number }>([
        {
          $match: {
            ...APPROVED_ACTIVE,
            subject: { $in: subjects },
          },
        },
        { $group: { _id: "$subject", count: { $sum: 1 } } },
      ])
      .toArray();
    for (const g of grouped) zeroed[g._id] = g.count;
    return zeroed;
  } catch {
    return zeroed;
  }
}
