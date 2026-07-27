import Link from "next/link";
import { hasClerkKeys } from "@/lib/clerk-enabled";

/**
 * The hero argument is the product: two schedules laid over each other, with the
 * rooms you were both in lit. Everything else on the page stays quiet.
 */
const YOUR_DAY = [
  { code: "D1R1", room: "Garry Tan", side: "EAST", shared: false },
  { code: "D1R2", room: "Dmitri Dolgov", side: "WEST", shared: true },
  { code: "D1R3", room: "Susan Kare", side: "WEST", shared: true },
  { code: "D2R1", room: "Peter Steinberger", side: "WEST", shared: false },
];

const THEIR_DAY = [
  { code: "D1R1", room: "Jeff Dean", side: "WEST", shared: false },
  { code: "D1R2", room: "Dmitri Dolgov", side: "WEST", shared: true },
  { code: "D1R3", room: "Susan Kare", side: "WEST", shared: true },
  { code: "D2R1", room: "Max Junestrand", side: "EAST", shared: false },
];

export default function Home() {
  return (
    <main className="flex-1 w-full">
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 sm:pt-24">
        <p className="code text-slate animate-rise" style={{ animationDelay: "0ms" }}>
          Jul 25–26 · Chase Center · 6,000 builders
        </p>

        <h1
          className="display text-[clamp(2.75rem,10.5vw,8.25rem)] mt-5 animate-rise"
          style={{ animationDelay: "70ms" }}
        >
          You were in
          <br />
          the same
          <br />
          <span className="text-orange">room.</span>
        </h1>

        <p
          className="mt-8 max-w-lg text-lg text-slate leading-relaxed animate-rise"
          style={{ animationDelay: "140ms" }}
        >
          Thirty thousand applied. Six thousand got in. You talked to maybe
          twenty, and got the name of maybe five. Batch finds the rest — by the
          rooms you were both standing in.
        </p>

        <div
          className="mt-10 flex flex-col sm:flex-row gap-3 animate-rise"
          style={{ animationDelay: "200ms" }}
        >
          {hasClerkKeys ? (
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center bg-orange text-white font-semibold px-8 py-4 hover:bg-orange-deep transition-colors"
            >
              Sign in with LinkedIn
            </Link>
          ) : (
            <span className="inline-flex items-center bg-surface border border-hairline text-slate px-8 py-4 text-sm">
              Sign-in is being configured.
            </span>
          )}
          <Link
            href="/directory"
            className="inline-flex items-center justify-center border border-graphite px-8 py-4 font-semibold hover:bg-graphite hover:text-concrete transition-colors"
          >
            Browse the directory
          </Link>
        </div>
      </section>

      <div className="floor-rule max-w-5xl mx-auto" />

      {/* The signature: two days, overlaid. */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="space-y-8">
            <DayTrack label="You" rows={YOUR_DAY} tone="self" />
            <DayTrack label="Ada Radcliffe" rows={THEIR_DAY} tone="other" />
          </div>

          <div className="lg:border-l lg:border-hairline lg:pl-10">
            <p className="display text-6xl text-orange">2</p>
            <p className="code text-slate mt-2">Rooms in common</p>
            <p className="text-sm text-slate mt-4 max-w-[15rem] leading-relaxed">
              Dolgov and Kare, both West. Enough to open with something better
              than &ldquo;what do you do?&rdquo;
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function DayTrack({
  label,
  rows,
  tone,
}: {
  label: string;
  rows: typeof YOUR_DAY;
  tone: "self" | "other";
}) {
  return (
    <div>
      <p className="code text-slate mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">
        {rows.map((row, i) => (
          <div
            key={row.code}
            className={[
              "animate-ignite border px-3 py-2.5 min-w-[8.5rem]",
              row.shared
                ? "bg-orange border-orange text-white"
                : tone === "self"
                  ? "bg-electric-wash border-electric/25 text-graphite"
                  : "bg-surface border-hairline text-graphite",
            ].join(" ")}
            style={{ animationDelay: `${260 + i * 90}ms` }}
          >
            <span
              className={`code block ${row.shared ? "text-white/75" : "text-slate"}`}
            >
              {row.code} · {row.side}
            </span>
            <span className="block text-sm font-semibold mt-1 leading-tight">
              {row.room}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
