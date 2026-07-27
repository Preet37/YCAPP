"use client";

import { useEffect, useState } from "react";

type Person = {
  id: string;
  name: string;
  photoUrl: string | null;
  linkedinUrl: string | null;
  headline: string | null;
  buildingText: string | null;
  lookingForText: string | null;
};

type SessionOption = { id: string; name: string; slug: string };

export default function DirectoryPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [sessionOptions, setSessionOptions] = useState<SessionOption[]>([]);
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
    <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
      <h1 className="font-serif text-3xl font-medium mb-6">Directory</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search what someone's building or looking for…"
          className="flex-1 border border-border rounded-xl px-4 py-2.5 bg-card focus:outline-none focus:ring-2 focus:ring-yc-orange/40"
        />
        <select
          value={session}
          onChange={(e) => setSession(e.target.value)}
          className="border border-border rounded-xl px-4 py-2.5 bg-card"
        >
          <option value="">All sessions</option>
          {sessionOptions.map((s) => (
            <option key={s.id} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : people.length === 0 ? (
        <p className="text-muted">
          No one matches yet — be the first to onboard, or check back soon.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {people.map((person) => (
            <li
              key={person.id}
              className="rounded-2xl border border-border bg-card p-5 flex gap-4"
            >
              {person.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={person.photoUrl}
                  alt={person.name}
                  className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-yc-orange-light flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">{person.name}</h3>
                  {person.linkedinUrl && (
                    <a
                      href={person.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-yc-orange hover:text-yc-orange-dark"
                    >
                      LinkedIn →
                    </a>
                  )}
                </div>
                {person.buildingText && (
                  <p className="text-sm mt-1">
                    <span className="text-muted">Building:</span> {person.buildingText}
                  </p>
                )}
                {person.lookingForText && (
                  <p className="text-sm">
                    <span className="text-muted">Looking for:</span> {person.lookingForText}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
