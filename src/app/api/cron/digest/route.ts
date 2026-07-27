import { NextRequest, NextResponse } from "next/server";
import { eq, sql, and, ne, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { matchDigests, userSessions, users } from "@/lib/db/schema";

const TOP_N = 3;
const CANDIDATE_POOL = 10;

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const db = getDb();

  const verifiedUsers = await db
    .select({ id: users.id, embedding: users.embedding })
    .from(users)
    .where(and(eq(users.verified, true), sql`${users.embedding} is not null`));

  let digestsWritten = 0;

  for (const user of verifiedUsers) {
    const candidates = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          eq(users.verified, true),
          ne(users.id, user.id),
          sql`${users.embedding} is not null`
        )
      )
      .orderBy(sql`${users.embedding} <=> ${JSON.stringify(user.embedding)}::vector`)
      .limit(CANDIDATE_POOL);

    if (candidates.length === 0) continue;

    const candidateIds = candidates.map((c) => c.id);
    const mySessions = await db
      .select({ sessionId: userSessions.sessionId })
      .from(userSessions)
      .where(eq(userSessions.userId, user.id));
    const mySessionIds = new Set(mySessions.map((s) => s.sessionId));

    const overlapRows = mySessionIds.size
      ? await db
          .select({ userId: userSessions.userId, sessionId: userSessions.sessionId })
          .from(userSessions)
          .where(inArray(userSessions.userId, candidateIds))
      : [];

    const overlapCount = new Map<string, number>();
    for (const row of overlapRows) {
      if (mySessionIds.has(row.sessionId)) {
        overlapCount.set(row.userId, (overlapCount.get(row.userId) ?? 0) + 1);
      }
    }

    const ranked = candidates
      .map((c, index) => ({
        id: c.id,
        distanceRank: index,
        overlap: overlapCount.get(c.id) ?? 0,
      }))
      .sort((a, b) => {
        const scoreA = -a.distanceRank + a.overlap * 2;
        const scoreB = -b.distanceRank + b.overlap * 2;
        return scoreB - scoreA;
      })
      .slice(0, TOP_N);

    for (const match of ranked) {
      await db.insert(matchDigests).values({
        userId: user.id,
        matchedUserId: match.id,
        score: 1 / (match.distanceRank + 1),
        sessionOverlapCount: match.overlap,
      });
      digestsWritten += 1;
    }
  }

  return NextResponse.json({ ok: true, usersProcessed: verifiedUsers.length, digestsWritten });
}
