import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { and, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { sessions, userSessions, users } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  const db = getDb();
  const { userId: clerkUserId } = await auth().catch(() => ({ userId: null as string | null }));

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const sessionSlug = searchParams.get("session")?.trim();

  let selfEmbedding: number[] | null = null;
  let selfDbId: string | null = null;
  if (clerkUserId) {
    const [self] = await db
      .select({ id: users.id, embedding: users.embedding })
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId));
    if (self) {
      selfDbId = self.id;
      selfEmbedding = self.embedding as unknown as number[] | null;
    }
  }

  // The viewer's own rooms, which is what every other track is measured against.
  const mySlugs = new Set<string>();
  if (selfDbId) {
    const rows = await db
      .select({ slug: sessions.slug })
      .from(userSessions)
      .innerJoin(sessions, eq(userSessions.sessionId, sessions.id))
      .where(eq(userSessions.userId, selfDbId));
    for (const row of rows) mySlugs.add(row.slug);
  }

  const filters = [eq(users.verified, true)];
  if (q) {
    filters.push(
      or(
        ilike(users.buildingText, `%${q}%`),
        ilike(users.lookingForText, `%${q}%`),
        ilike(users.headline, `%${q}%`),
        ilike(users.name, `%${q}%`)
      )!
    );
  }
  if (selfDbId) {
    filters.push(sql`${users.id} != ${selfDbId}`);
  }

  let sessionUserIds: Set<string> | null = null;
  if (sessionSlug) {
    const rows = await db
      .select({ userId: userSessions.userId })
      .from(userSessions)
      .innerJoin(sessions, eq(userSessions.sessionId, sessions.id))
      .where(eq(sessions.slug, sessionSlug));
    sessionUserIds = new Set(rows.map((r) => r.userId));
  }

  const orderBy = selfEmbedding
    ? sql`${users.embedding} <=> ${JSON.stringify(selfEmbedding)}::vector`
    : sql`${users.createdAt} desc`;

  const results = await db
    .select({
      id: users.id,
      name: users.name,
      photoUrl: users.photoUrl,
      linkedinUrl: users.linkedinUrl,
      headline: users.headline,
      buildingText: users.buildingText,
      lookingForText: users.lookingForText,
    })
    .from(users)
    .where(and(...filters))
    .orderBy(orderBy)
    .limit(100);

  const filtered = sessionUserIds
    ? results.filter((r) => sessionUserIds!.has(r.id))
    : results;

  // One round-trip for every listed person's rooms, rather than a query per card.
  const roomsByUser = new Map<string, { slug: string; name: string; type: string }[]>();
  if (filtered.length) {
    const rows = await db
      .select({
        userId: userSessions.userId,
        slug: sessions.slug,
        name: sessions.name,
        type: sessions.type,
      })
      .from(userSessions)
      .innerJoin(sessions, eq(userSessions.sessionId, sessions.id))
      .where(
        inArray(
          userSessions.userId,
          filtered.map((r) => r.id)
        )
      );
    for (const row of rows) {
      const list = roomsByUser.get(row.userId) ?? [];
      list.push({ slug: row.slug, name: row.name, type: row.type });
      roomsByUser.set(row.userId, list);
    }
  }

  const people = filtered.map((person) => {
    const rooms = roomsByUser.get(person.id) ?? [];
    return {
      ...person,
      sessions: rooms,
      sharedSlugs: rooms.filter((r) => mySlugs.has(r.slug)).map((r) => r.slug),
    };
  });

  // Surface the people you actually stood next to first: shared rooms outrank a
  // marginally closer embedding, since co-location is the thing you can act on.
  if (mySlugs.size) {
    people.sort((a, b) => b.sharedSlugs.length - a.sharedSlugs.length);
  }

  const allSessions = await db.select().from(sessions).orderBy(sessions.name);

  return NextResponse.json({
    people,
    sessions: allSessions,
    mySessionSlugs: [...mySlugs],
  });
}
