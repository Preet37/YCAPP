import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { sessions, userSessions, users, verifications } from "@/lib/db/schema";
import { embedProfile, verifyCredential } from "@/lib/ai";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const buildingText = String(formData.get("buildingText") ?? "");
  const lookingForText = String(formData.get("lookingForText") ?? "");
  const linkedinUrl = String(formData.get("linkedinUrl") ?? "");
  const credentialFile = formData.get("credentialImage");

  if (!(credentialFile instanceof File)) {
    return NextResponse.json({ error: "Missing credential image" }, { status: 400 });
  }

  const name = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
    clerkUser.username ||
    "Startup School attendee";

  const arrayBuffer = await credentialFile.arrayBuffer();
  const imageBytes = Buffer.from(arrayBuffer);
  const mediaType = credentialFile.type || "image/jpeg";

  const verification = await verifyCredential(imageBytes, mediaType, name);

  // A badge/schedule printed with someone else's name is a shared screenshot, not
  // proof this person attended. `null` means no name was visible, which we allow.
  const nameMismatch = verification.nameMatchesClaim === false;
  const passesVerification = verification.isValidCredential && !nameMismatch;

  const blob = await put(`credentials/${userId}-${Date.now()}`, imageBytes, {
    access: "private",
    contentType: mediaType,
  });

  const db = getDb();

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkUserId, userId));

  const userValues = {
    clerkUserId: userId,
    name,
    linkedinUrl,
    photoUrl: clerkUser.imageUrl,
    headline: buildingText.slice(0, 140),
    buildingText,
    lookingForText,
    verified: passesVerification,
  };

  let dbUserId: string;
  if (existing) {
    await db.update(users).set(userValues).where(eq(users.id, existing.id));
    dbUserId = existing.id;
  } else {
    const [inserted] = await db.insert(users).values(userValues).returning({ id: users.id });
    dbUserId = inserted.id;
  }

  await db.insert(verifications).values({
    userId: dbUserId,
    imageBlobUrl: blob.url,
    modelResponseJson: JSON.stringify(verification),
    status: passesVerification ? "verified" : "rejected",
  });

  if (!passesVerification) {
    return NextResponse.json(
      {
        reason: nameMismatch
          ? `That credential is printed with a different name (${verification.nameOnCredential}). Please upload your own badge or schedule.`
          : verification.reason ??
            "That doesn't look like a valid Startup School credential.",
      },
      { status: 422 }
    );
  }

  for (const session of verification.sessions) {
    const slug = slugify(session.name);
    if (!slug) continue;

    const [existingSession] = await db
      .select({ id: sessions.id })
      .from(sessions)
      .where(eq(sessions.slug, slug));

    const sessionId = existingSession
      ? existingSession.id
      : (
          await db
            .insert(sessions)
            .values({ name: session.name, slug, type: session.type })
            .returning({ id: sessions.id })
        )[0].id;

    await db
      .insert(userSessions)
      .values({ userId: dbUserId, sessionId })
      .onConflictDoNothing();
  }

  const embedding = await embedProfile(buildingText, lookingForText);
  await db.update(users).set({ embedding }).where(eq(users.id, dbUserId));

  return NextResponse.json({ ok: true });
}
