import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { fetchGithubProfile } from "@/lib/github";

/**
 * Returns suggestions for the signed-in person's own profile. It never writes to
 * the database — the form fills the fields in and the person edits or clears them
 * before saving, so nothing they didn't look at ends up published.
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { githubUsername } = await req.json().catch(() => ({ githubUsername: "" }));
  if (!githubUsername || typeof githubUsername !== "string") {
    return NextResponse.json({ error: "Add a GitHub username first" }, { status: 400 });
  }

  const profile = await fetchGithubProfile(githubUsername);
  if (!profile) {
    return NextResponse.json(
      { error: `No public GitHub profile found for "${githubUsername}"` },
      { status: 404 }
    );
  }

  return NextResponse.json({ profile });
}
