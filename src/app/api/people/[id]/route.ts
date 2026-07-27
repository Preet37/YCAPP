import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { sessions, userSessions, users } from "@/lib/db/schema";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  const { userId: clerkUserId } = await auth().catch(() => ({ userId: null as string | null }));

  const [person] = await db
    .select({
      id: users.id,
      name: users.name,
      photoUrl: users.photoUrl,
      linkedinUrl: users.linkedinUrl,
      headline: users.headline,
      buildingText: users.buildingText,
      lookingForText: users.lookingForText,
      bio: users.bio,
      githubUsername: users.githubUsername,
      githubData: users.githubData,
      websiteUrl: users.websiteUrl,
      xUrl: users.xUrl,
      devpostUrl: users.devpostUrl,
      interests: users.interests,
      verified: users.verified,
    })
    .from(users)
    .where(eq(users.id, id));

  if (!person || !person.verified) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rooms = await db
    .select({ slug: sessions.slug, name: sessions.name, type: sessions.type })
    .from(userSessions)
    .innerJoin(sessions, eq(userSessions.sessionId, sessions.id))
    .where(eq(userSessions.userId, person.id))
    .orderBy(sessions.slug);

  // Which of those rooms the viewer was also in.
  let sharedSlugs: string[] = [];
  if (clerkUserId) {
    const [self] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId));
    if (self) {
      const mine = await db
        .select({ slug: sessions.slug })
        .from(userSessions)
        .innerJoin(sessions, eq(userSessions.sessionId, sessions.id))
        .where(eq(userSessions.userId, self.id));
      const mySlugs = new Set(mine.map((m) => m.slug));
      sharedSlugs = rooms.filter((r) => mySlugs.has(r.slug)).map((r) => r.slug);
    }
  }

  return NextResponse.json({
    person: {
      ...person,
      github: person.githubData ? JSON.parse(person.githubData) : null,
    },
    rooms,
    sharedSlugs,
  });
}
