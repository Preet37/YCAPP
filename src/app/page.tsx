import Link from "next/link";
import { hasClerkKeys } from "@/lib/clerk-enabled";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center gap-8">
      <span className="rounded-full bg-yc-orange-light text-yc-orange-dark text-sm font-medium px-4 py-1.5 border border-yc-orange/20">
        Built for YC Startup School 2026
      </span>

      <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-medium max-w-3xl leading-tight">
        You shared a room with them.{" "}
        <span className="text-yc-orange">Now find them.</span>
      </h1>

      <p className="max-w-xl text-lg text-muted">
        Batch matches Startup School attendees by what you&apos;re building, who
        you want to meet, and the sessions you were both in — Jeff Dean&apos;s
        keynote, your partner meeting, the breakout no one could talk in.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        {hasClerkKeys ? (
          <Link
            href="/onboarding"
            className="rounded-full bg-yc-orange text-white font-semibold px-8 py-3 hover:bg-yc-orange-dark transition-colors"
          >
            Sign in with LinkedIn
          </Link>
        ) : (
          <span className="rounded-full bg-background-alt border border-border text-muted px-8 py-3 text-sm">
            Sign-in is being configured — check back shortly.
          </span>
        )}
        <Link
          href="/directory"
          className="rounded-full border border-border px-8 py-3 font-medium hover:bg-background-alt transition-colors"
        >
          Browse the directory
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mt-8 text-left">
        <Feature
          title="Verified attendees only"
          body="Upload your badge or schedule — we verify it's real before you're listed."
        />
        <Feature
          title="Matched, not just listed"
          body="Ranked by what you're building and who you want to meet, not a raw feed."
        />
        <Feature
          title="Session-aware"
          body="Filter by the exact keynote, breakout, or partner meeting you attended."
        />
      </div>
    </main>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5">
      <h3 className="font-semibold mb-1.5">{title}</h3>
      <p className="text-sm text-muted">{body}</p>
    </div>
  );
}
