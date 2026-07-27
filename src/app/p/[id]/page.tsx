"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import type { GithubProfile } from "@/lib/github";

type Room = { slug: string; name: string; type: string };

type Person = {
  id: string;
  name: string;
  photoUrl: string | null;
  linkedinUrl: string | null;
  headline: string | null;
  buildingText: string | null;
  lookingForText: string | null;
  bio: string | null;
  githubUsername: string | null;
  websiteUrl: string | null;
  xUrl: string | null;
  devpostUrl: string | null;
  interests: string[] | null;
  github: GithubProfile | null;
};

const ROOM_GROUPS: { type: string; label: string }[] = [
  { type: "breakout", label: "Breakouts" },
  { type: "partner_meeting", label: "Suite sessions" },
  { type: "expo", label: "Expo" },
  { type: "keynote", label: "Center Court" },
  { type: "after_party", label: "After-parties" },
];

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<{
    person: Person;
    rooms: Room[];
    sharedSlugs: string[];
  } | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    fetch(`/api/people/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setData(d);
        setStatus("ready");
      })
      .catch(() => setStatus("missing"));
  }, [id]);

  if (status === "loading") {
    return <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-14 code text-slate">Loading</main>;
  }

  if (status === "missing" || !data) {
    return (
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-14">
        <p className="display text-3xl mb-3">No profile here</p>
        <p className="text-slate text-sm mb-6">
          This person either hasn&apos;t joined yet or isn&apos;t verified.
        </p>
        <Link href="/directory" className="code text-orange hover:text-orange-deep">
          ← Back to the directory
        </Link>
      </main>
    );
  }

  const { person, rooms, sharedSlugs } = data;
  const shared = new Set(sharedSlugs);
  const links = [
    person.linkedinUrl && { label: "LinkedIn", url: person.linkedinUrl },
    person.githubUsername && {
      label: "GitHub",
      url: `https://github.com/${person.githubUsername}`,
    },
    person.websiteUrl && { label: "Website", url: person.websiteUrl },
    person.xUrl && { label: "X", url: person.xUrl },
    person.devpostUrl && { label: "Devpost", url: person.devpostUrl },
  ].filter(Boolean) as { label: string; url: string }[];

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
      <Link href="/directory" className="code text-slate hover:text-graphite transition-colors">
        ← Directory
      </Link>

      <header className="mt-8 flex flex-col sm:flex-row gap-6 sm:items-start">
        {person.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={person.photoUrl}
            alt=""
            className="w-28 h-28 object-cover border border-hairline flex-shrink-0"
          />
        ) : (
          <div className="w-28 h-28 bg-concrete-deep flex items-center justify-center flex-shrink-0">
            <span className="display text-4xl text-slate">{person.name.charAt(0)}</span>
          </div>
        )}

        <div className="min-w-0">
          <h1 className="display text-4xl sm:text-5xl">{person.name}</h1>
          {sharedSlugs.length > 0 && (
            <p className="code text-orange mt-2">
              {sharedSlugs.length} room{sharedSlugs.length === 1 ? "" : "s"} in common with you
            </p>
          )}
          {links.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="code border border-hairline bg-surface px-2.5 py-1.5 hover:border-orange hover:text-orange transition-colors"
                >
                  {link.label} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      </header>

      {person.bio && (
        <p className="mt-8 leading-relaxed max-w-2xl">{person.bio}</p>
      )}

      <div className="floor-rule my-10" />

      <section className="grid sm:grid-cols-2 gap-8">
        {person.buildingText && (
          <div>
            <h2 className="code text-slate mb-2.5">Building</h2>
            <p className="leading-relaxed">{person.buildingText}</p>
          </div>
        )}
        {person.lookingForText && (
          <div>
            <h2 className="code text-slate mb-2.5">Wants to meet</h2>
            <p className="leading-relaxed">{person.lookingForText}</p>
          </div>
        )}
      </section>

      {person.interests && person.interests.length > 0 && (
        <section className="mt-10">
          <h2 className="code text-slate mb-3">Interests</h2>
          <div className="flex flex-wrap gap-1.5">
            {person.interests.map((tag) => (
              <span key={tag} className="code border border-hairline bg-surface px-2.5 py-1.5">
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {rooms.length > 0 && (
        <section className="mt-12">
          <h2 className="display text-2xl mb-1">Their two days</h2>
          <p className="text-sm text-slate mb-5">
            Orange marks a room you were both in.
          </p>
          <div className="space-y-6">
            {ROOM_GROUPS.map((group) => {
              const inGroup = rooms.filter((r) => r.type === group.type);
              if (inGroup.length === 0) return null;
              return (
                <div key={group.type}>
                  <h3 className="code text-slate mb-2">{group.label}</h3>
                  <ul className="space-y-1.5">
                    {inGroup.map((room) => (
                      <li
                        key={room.slug}
                        className={[
                          "text-sm px-3 py-2.5 border-l-2",
                          shared.has(room.slug)
                            ? "border-orange bg-orange-wash font-semibold"
                            : "border-hairline bg-surface",
                        ].join(" ")}
                      >
                        {room.name}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {person.github && (
        <section className="mt-12">
          <h2 className="display text-2xl mb-1">Code</h2>
          <p className="code text-slate mb-5">
            {person.github.publicRepos} public repos · {person.github.followers} followers
          </p>

          {person.github.languages.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {person.github.languages.map((lang) => (
                <span key={lang} className="code border border-hairline bg-surface px-2.5 py-1.5">
                  {lang}
                </span>
              ))}
            </div>
          )}

          <ul className="grid sm:grid-cols-2 gap-2">
            {person.github.topRepos.map((repo) => (
              <li key={repo.url}>
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full bg-surface border border-hairline p-4 hover:border-orange transition-colors"
                >
                  <span className="font-semibold text-sm block">{repo.name}</span>
                  {repo.description && (
                    <span className="text-xs text-slate block mt-1.5 leading-relaxed">
                      {repo.description}
                    </span>
                  )}
                  <span className="code text-slate block mt-2.5">
                    {repo.language ?? "—"} · ★ {repo.stars}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
