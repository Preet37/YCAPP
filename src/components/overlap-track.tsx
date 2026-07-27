import { EVENT_SESSIONS } from "@/lib/event-catalog";

/**
 * The signature device. Everyone's two days reduce to a path through rooms, so a
 * person is drawn as a track of room markers. Markers you were both in ignite
 * orange; the rest stay hairline. Used full-size on the landing page and
 * miniaturised on every directory card so the same shape means the same thing.
 */

/** Rooms worth drawing: the plenary Center Court sessions held everyone, so they say nothing. */
const TRACK_ROOMS = EVENT_SESSIONS.filter((s) => s.highSignal);

export function shortLabel(slug: string) {
  const room = TRACK_ROOMS.find((r) => r.slug === slug);
  if (!room) return null;
  const round = room.slug.match(/^d(\d)-r(\d)/);
  if (round) {
    const side = room.slug.endsWith("-east") ? "E" : room.slug.endsWith("-west") ? "W" : "•";
    return `D${round[1]}R${round[2]}${side}`;
  }
  if (room.type === "partner_meeting") return "SUITE";
  if (room.type === "expo") return "EXPO";
  return null;
}

export function TrackStrip({
  slugs,
  sharedSlugs,
  tone = "neutral",
  className = "",
}: {
  slugs: string[];
  sharedSlugs?: string[];
  tone?: "neutral" | "self";
  className?: string;
}) {
  const owned = new Set(slugs);
  const shared = new Set(sharedSlugs ?? []);

  // Only the rooms this person was actually in. Ghosting all twelve on every card
  // turned the list into noise, and most people attended four or five.
  const attended = TRACK_ROOMS.filter((room) => owned.has(room.slug));
  if (attended.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`}>
      {attended.map((room) => {
        const isShared = shared.has(room.slug);
        const label = shortLabel(room.slug);
        if (!label) return null;

        return (
          <span
            key={room.slug}
            title={room.name}
            className={[
              "code px-1.5 py-1 leading-none transition-colors",
              isShared
                ? "bg-orange text-white font-bold"
                : tone === "self"
                  ? "bg-electric-wash text-electric"
                  : "bg-concrete-deep text-slate",
            ].join(" ")}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}
