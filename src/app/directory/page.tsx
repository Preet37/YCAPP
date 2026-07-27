"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrackStrip } from "@/components/overlap-track";

type Room = { slug: string; name: string; type: string };

type Person = {
  id: string;
  name: string;
  photoUrl: string | null;
  linkedinUrl: string | null;
  headline: string | null;
  buildingText: string | null;
  lookingForText: string | null;
  sessions: Room[];
  sharedSlugs: string[];
};

type SessionOption = { id: string; name: string; slug: string; type: string };

export default function DirectoryPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [sessionOptions, setSessionOptions] = useState<SessionOption[]>([]);
  const [mySlugs, setMySlugs] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [session, setSession] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (session) params.set("session", session);

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/directory?${params.toString()}`);
        const data = await res.json();
        if (!ignore) {
          setPeople(data.people ?? []);
          setSessionOptions(data.sessions ?? []);
          setMySlugs(data.mySessionSlugs ?? []);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [q, session]);

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
      <div className="flex flex-wrap items-baseline justify-between gap-4 mb-8">
        <h1 className="display text-5xl sm:text-6xl">Directory</h1>
        {mySlugs.length > 0 && (
          <p className="code text-slate">
            Your rooms · {mySlugs.length}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-10">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search what someone is building"
          className="flex-1 border border-hairline bg-surface px-4 py-3 text-sm focus:outline-none focus:border-orange transition-colors"
        />
        <select
          value={session}
          onChange={(e) => setSession(e.target.value)}
          className="border border-hairline bg-surface px-4 py-3 text-sm focus:outline-none focus:border-orange transition-colors"
        >
          <option value="">Every room</option>
          {sessionOptions.map((s) => (
            <option key={s.id} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="code text-slate">Loading</p>
      ) : people.length === 0 ? (
        <div className="border border-dashed border-hairline p-12 text-center">
          <p className="display text-2xl mb-2">Nobody here yet</p>
          <p className="text-sm text-slate max-w-sm mx-auto">
            {q || session
              ? "No one matches that filter. Try a different room, or clear the search."
              : "Be the first to join. Verify your badge and the people you shared rooms with will show up here as they sign up."}
          </p>
        </div>
      ) : (
        <ul className="grid gap-3">
          {people.map((person) => (
            <li key={person.id}>
              <Link
                href={`/p/${person.id}`}
                className="block bg-surface border border-hairline p-5 hover:border-orange transition-colors"
              >
                <div className="flex gap-4">
                {person.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={person.photoUrl}
                    alt=""
                    className="w-12 h-12 object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 bg-concrete-deep flex-shrink-0 flex items-center justify-center">
                    <span className="display text-lg text-slate">
                      {person.name.charAt(0)}
                    </span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-semibold truncate">{person.name}</h2>
                      {person.sharedSlugs.length > 0 && (
                        <p className="code text-orange mt-0.5">
                          {person.sharedSlugs.length} room
                          {person.sharedSlugs.length === 1 ? "" : "s"} in common
                        </p>
                      )}
                    </div>
                    <span className="code text-slate flex-shrink-0">View →</span>
                  </div>

                  {person.buildingText && (
                    <p className="text-sm mt-2.5 leading-relaxed">
                      {person.buildingText}
                    </p>
                  )}
                  {person.lookingForText && (
                    <p className="text-sm text-slate mt-1 leading-relaxed">
                      Wants to meet: {person.lookingForText}
                    </p>
                  )}

                    {person.sessions.length > 0 && (
                      <TrackStrip
                        slugs={person.sessions.map((s) => s.slug)}
                        sharedSlugs={person.sharedSlugs}
                        className="mt-3.5"
                      />
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
