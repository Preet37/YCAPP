/**
 * Removes the fake profiles used to verify matching before launch.
 * Run once before sharing the link publicly:
 *   npx dotenv -e .env.local -- npx tsx scripts/purge-seed.ts
 */
import { getDb } from "@/lib/db";
import { sessions, users } from "@/lib/db/schema";
import { inArray, like } from "drizzle-orm";

const TEST_SESSION_SLUGS = [
  "keynote-jeff-dean",
  "keynote-gary-tan",
  "breakout-fundraising-101",
  "partner-meeting-group-12",
];

async function main() {
  const db = getDb();

  // user_sessions and match_digests cascade from users
  const deletedUsers = await db
    .delete(users)
    .where(like(users.clerkUserId, "seed_%"))
    .returning({ name: users.name });

  const deletedSessions = await db
    .delete(sessions)
    .where(inArray(sessions.slug, TEST_SESSION_SLUGS))
    .returning({ slug: sessions.slug });

  console.log(`removed ${deletedUsers.length} seed profiles: ${deletedUsers.map((u) => u.name).join(", ")}`);
  console.log(`removed ${deletedSessions.length} placeholder sessions`);

  const remaining = await db.select().from(users);
  console.log(`real users remaining: ${remaining.length}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
