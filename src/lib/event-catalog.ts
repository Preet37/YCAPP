/**
 * The published Startup School 2026 program (Sat Jul 26 – Sun Jul 27, Chase Center).
 *
 * Seeding the real program rather than letting the vision model invent session names
 * keeps slugs canonical, so "Arena Breakout: Jeff Dean" and "Jeff Dean (West)" collapse
 * to the same filter instead of fragmenting the directory.
 *
 * `highSignal` marks sessions that actually discriminate between attendees. Center Court
 * keynotes were plenary — everyone was in the room, so sharing one says nothing. Arena
 * breakouts ran two tracks per round, Suite sessions were assigned and QR-checked, and
 * after-parties required separate signup: those are the ones worth matching on.
 */

export type CatalogSession = {
  name: string;
  slug: string;
  type: "keynote" | "breakout" | "partner_meeting" | "expo" | "after_party" | "other";
  day: 1 | 2;
  highSignal: boolean;
};

export const EVENT_SESSIONS: CatalogSession[] = [
  // ---- Day 1 (Sat Jul 26) Center Court — plenary ----
  { name: "Day 1 Kick-Off — Garry Tan", slug: "d1-kickoff-garry-tan", type: "keynote", day: 1, highSignal: false },
  { name: "Center Court — Jensen Huang", slug: "d1-cc-jensen-huang", type: "keynote", day: 1, highSignal: false },
  { name: "Center Court — Boris Cherny", slug: "d1-cc-boris-cherny", type: "keynote", day: 1, highSignal: false },

  // ---- Day 1 Arena Breakouts — two tracks per round ----
  { name: "Day 1 R1 — Garry Tan (East)", slug: "d1-r1-garry-tan-east", type: "breakout", day: 1, highSignal: true },
  { name: "Day 1 R1 — Jeff Dean (West)", slug: "d1-r1-jeff-dean-west", type: "breakout", day: 1, highSignal: true },
  { name: "Day 1 R2 — Blake Scholl (East)", slug: "d1-r2-blake-scholl-east", type: "breakout", day: 1, highSignal: true },
  { name: "Day 1 R2 — Dmitri Dolgov (West)", slug: "d1-r2-dmitri-dolgov-west", type: "breakout", day: 1, highSignal: true },
  { name: "Day 1 R3 — Michael Kratsios (East)", slug: "d1-r3-michael-kratsios-east", type: "breakout", day: 1, highSignal: true },
  { name: "Day 1 R3 — Susan Kare (West)", slug: "d1-r3-susan-kare-west", type: "breakout", day: 1, highSignal: true },

  // ---- Day 2 (Sun Jul 27) Center Court — plenary ----
  { name: "Day 2 Kick-Off — Garry Tan", slug: "d2-kickoff-garry-tan", type: "keynote", day: 2, highSignal: false },
  { name: "Center Court — Patrick Collison", slug: "d2-cc-patrick-collison", type: "keynote", day: 2, highSignal: false },
  { name: "Center Court — Alexandr Wang", slug: "d2-cc-alexandr-wang", type: "keynote", day: 2, highSignal: false },
  { name: "Center Court — Sam Altman", slug: "d2-cc-sam-altman", type: "keynote", day: 2, highSignal: false },

  // ---- Day 2 Arena Breakouts + Research Symposium ----
  { name: "Day 2 R1 — Max Junestrand (East)", slug: "d2-r1-max-junestrand-east", type: "breakout", day: 2, highSignal: true },
  { name: "Day 2 R1 — Peter Steinberger (West)", slug: "d2-r1-peter-steinberger-west", type: "breakout", day: 2, highSignal: true },
  { name: "Day 2 R2 — Max Hodak (East)", slug: "d2-r2-max-hodak-east", type: "breakout", day: 2, highSignal: true },
  { name: "Day 2 R2 — Chelsea Finn (West)", slug: "d2-r2-chelsea-finn-west", type: "breakout", day: 2, highSignal: true },
  { name: "Day 2 R2 — YCML Research Symposium (JP Morgan Club)", slug: "d2-r2-ycml-research-symposium", type: "breakout", day: 2, highSignal: true },

  // ---- Assigned, capacity-limited ----
  { name: "Suite Session with a YC Partner (S1–S44)", slug: "suite-session-yc-partner", type: "partner_meeting", day: 2, highSignal: true },
  { name: "Research Poster Session", slug: "research-poster-session", type: "expo", day: 2, highSignal: true },
  { name: "Robotics & Hardware Demos", slug: "robotics-hardware-demos", type: "expo", day: 2, highSignal: true },
];

/** After-parties required separate per-day signup, so they are strong co-location signals. */
export const AFTER_PARTIES: CatalogSession[] = [
  // Day 2 (tonight) — hosted by YC's cloud & AI partners
  { name: "Day 2 · AWS After Party", slug: "ap2-aws", type: "after_party", day: 2, highSignal: true },
  { name: "Day 2 · Microsoft After Party", slug: "ap2-microsoft", type: "after_party", day: 2, highSignal: true },
  { name: "Day 2 · Google DeepMind After Party", slug: "ap2-google-deepmind", type: "after_party", day: 2, highSignal: true },
  { name: "Day 2 · Fondo Afterparty", slug: "ap2-fondo", type: "after_party", day: 2, highSignal: true },

  // Day 1 — hosted by YC alums
  { name: "Day 1 · Overnight Batch (Corgi & Merge)", slug: "ap1-corgi-merge", type: "after_party", day: 1, highSignal: true },
  { name: "Day 1 · Helium / Coval / Phonely", slug: "ap1-helium-coval-phonely", type: "after_party", day: 1, highSignal: true },
  { name: "Day 1 · Icarus After Party", slug: "ap1-icarus", type: "after_party", day: 1, highSignal: true },
  { name: "Day 1 · LemonLime — Calling All Crazy Builders", slug: "ap1-lemonlime", type: "after_party", day: 1, highSignal: true },
  { name: "Day 1 · Exa After-After Party", slug: "ap1-exa", type: "after_party", day: 1, highSignal: true },
  { name: "Day 1 · Grade After Party Mixer", slug: "ap1-grade", type: "after_party", day: 1, highSignal: true },
  { name: "Day 1 · YC Health x AI fireside (Terra)", slug: "ap1-terra-health-ai", type: "after_party", day: 1, highSignal: true },
  { name: "Day 1 · Primitive + HumanLayer", slug: "ap1-primitive-humanlayer", type: "after_party", day: 1, highSignal: true },
  { name: "Day 1 · Nowadays AI Afterparty", slug: "ap1-nowadays", type: "after_party", day: 1, highSignal: true },
  { name: "Day 1 · Infra Layer After Party", slug: "ap1-infra-layer", type: "after_party", day: 1, highSignal: true },
  { name: "Day 1 · Roboflow After Party", slug: "ap1-roboflow", type: "after_party", day: 1, highSignal: true },
  { name: "Day 1 · Wafer Poker Night", slug: "ap1-wafer-poker", type: "after_party", day: 1, highSignal: true },
  { name: "Day 1 · Sonder × Lemma Afterparty", slug: "ap1-sonder-lemma", type: "after_party", day: 1, highSignal: true },
  { name: "Day 1 · Tavus Afterparty", slug: "ap1-tavus", type: "after_party", day: 1, highSignal: true },
  { name: "Day 1 · Founder Hot Pot (Superset / Halluminate)", slug: "ap1-founder-hot-pot", type: "after_party", day: 1, highSignal: true },
  { name: "Day 1 · Respan After Party", slug: "ap1-respan", type: "after_party", day: 1, highSignal: true },
  { name: "Day 1 · Mintlify After Party", slug: "ap1-mintlify", type: "after_party", day: 1, highSignal: true },
  { name: "Day 1 · PostHog After Party", slug: "ap1-posthog", type: "after_party", day: 1, highSignal: true },
  { name: "Day 1 · Afterhours @ Sōhn (Greptile)", slug: "ap1-greptile-sohn", type: "after_party", day: 1, highSignal: true },
  { name: "Day 1 · Stripe — Made in San Francisco", slug: "ap1-stripe", type: "after_party", day: 1, highSignal: true },
  { name: "Day 1 · Archil Afterparty", slug: "ap1-archil", type: "after_party", day: 1, highSignal: true },
  { name: "Day 1 · AgentMail After Party", slug: "ap1-agentmail", type: "after_party", day: 1, highSignal: true },
  { name: "Day 1 · LegalOS After Party", slug: "ap1-legalos", type: "after_party", day: 1, highSignal: true },
  { name: "Day 1 · Deus Ex Machina (Dedalus / Koyal)", slug: "ap1-dedalus-koyal", type: "after_party", day: 1, highSignal: true },
  { name: "Day 1 · Moss Afterparty (Moss / Supabase)", slug: "ap1-moss-supabase", type: "after_party", day: 1, highSignal: true },
  { name: "Day 1 · d_model @ Startup School", slug: "ap1-d-model", type: "after_party", day: 1, highSignal: true },
  { name: "Day 1 · Party in the Presidio (Adaptional)", slug: "ap1-adaptional", type: "after_party", day: 1, highSignal: true },
];

export const ALL_CATALOG_SESSIONS = [...EVENT_SESSIONS, ...AFTER_PARTIES];

/** Compact list handed to the vision model so it maps a schedule screenshot onto real slugs. */
export function catalogPromptList() {
  return EVENT_SESSIONS.map((s) => `${s.slug} = ${s.name}`).join("\n");
}
