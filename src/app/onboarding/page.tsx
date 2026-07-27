"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AFTER_PARTIES } from "@/lib/event-catalog";

const DAY_2_PARTIES = AFTER_PARTIES.filter((p) => p.day === 2);
const DAY_1_PARTIES = AFTER_PARTIES.filter((p) => p.day === 1);

type SubmitState = "idle" | "submitting" | "rejected" | "error";

export default function OnboardingPage() {
  const router = useRouter();
  const [state, setState] = useState<SubmitState>("idle");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ url: string; name: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [github, setGithub] = useState("");
  const [pulling, setPulling] = useState(false);
  const [pullNote, setPullNote] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [interests, setInterests] = useState("");

  async function pullGithub() {
    setPulling(true);
    setPullNote(null);
    try {
      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ githubUsername: github }),
      });
      const data = await res.json();

      if (!res.ok) {
        setPullNote(data.error ?? "Couldn't read that profile.");
        return;
      }

      // Suggestions only — fill blanks, never overwrite what they already typed.
      const p = data.profile;
      if (p.bio && !bio) setBio(p.bio);
      if (p.websiteUrl && !website) setWebsite(p.websiteUrl);
      if (p.xUrl && !xUrl) setXUrl(p.xUrl);
      if (p.languages?.length && !interests) setInterests(p.languages.join(", "));

      setPullNote(
        `Found @${p.username} — ${p.publicRepos} repos, ${p.followers} followers. Check what filled in below and change anything that's off.`
      );
    } catch {
      setPullNote("Couldn't reach GitHub. Fill the fields in yourself.");
    } finally {
      setPulling(false);
    }
  }

  function handleFile(file: File | undefined) {
    if (!file) return;
    setPreview({ url: URL.createObjectURL(file), name: file.name });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");
    setRejectionReason(null);
    setErrorDetail(null);

    const res = await fetch("/api/onboarding", {
      method: "POST",
      body: new FormData(e.currentTarget),
    });

    if (res.ok) {
      router.push("/directory");
      return;
    }

    if (res.status === 422) {
      const data = await res.json();
      setState("rejected");
      setRejectionReason(data.reason ?? "That credential could not be verified.");
      return;
    }

    const detail = await res.json().catch(() => null);
    setErrorDetail(detail?.detail ?? null);
    setState("error");
  }

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-14">
      <p className="code text-slate">Step 1 of 1</p>
      <h1 className="display text-5xl sm:text-6xl mt-3">
        Claim your <span className="text-orange">seat.</span>
      </h1>
      <p className="text-slate mt-4 max-w-md leading-relaxed">
        Two answers and one screenshot. The screenshot is how we know you were
        actually there, and it&apos;s what maps you to the rooms you sat in.
      </p>

      <div className="floor-rule my-10" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
        <fieldset className="space-y-5">
          <legend className="code text-slate mb-4">Your work</legend>
          <Field
            label="What are you building?"
            name="buildingText"
            placeholder="A physical-AI pipeline for data automation"
          />
          <Field
            label="Who do you need to meet?"
            name="lookingForText"
            placeholder="A cofounder who is self-aware about the hard parts"
          />
          <div>
            <label htmlFor="linkedinUrl" className="block text-sm font-semibold mb-2">
              Your LinkedIn
            </label>
            <input
              id="linkedinUrl"
              name="linkedinUrl"
              type="url"
              required
              placeholder="https://linkedin.com/in/you"
              className="w-full border border-hairline bg-surface px-4 py-3 text-sm focus:outline-none focus:border-orange transition-colors"
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className="code text-slate mb-1">Where else you live</legend>
          <p className="text-xs text-slate mb-4 leading-relaxed">
            Optional. Add your GitHub and pull the rest in — we read your public
            GitHub profile and fill the fields below. Edit or clear anything
            before you save; nothing is published until you do.
          </p>

          <div className="flex gap-2 mb-4">
            <input
              name="githubUsername"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="github username"
              className="flex-1 border border-hairline bg-surface px-4 py-3 text-sm focus:outline-none focus:border-orange transition-colors"
            />
            <button
              type="button"
              onClick={pullGithub}
              disabled={!github.trim() || pulling}
              className="code border border-graphite px-4 hover:bg-graphite hover:text-concrete transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {pulling ? "Reading…" : "Pull it in"}
            </button>
          </div>

          {pullNote && (
            <p className="text-xs mb-4 border-l-2 border-orange bg-orange-wash px-3 py-2 leading-relaxed">
              {pullNote}
            </p>
          )}

          <div className="space-y-3">
            <textarea
              name="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="A short bio — what you've worked on, what you know well"
              className="w-full border border-hairline bg-surface px-4 py-3 text-sm resize-none focus:outline-none focus:border-orange transition-colors"
            />
            <input
              name="websiteUrl"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="Personal site"
              className="w-full border border-hairline bg-surface px-4 py-3 text-sm focus:outline-none focus:border-orange transition-colors"
            />
            <input
              name="xUrl"
              value={xUrl}
              onChange={(e) => setXUrl(e.target.value)}
              placeholder="X profile"
              className="w-full border border-hairline bg-surface px-4 py-3 text-sm focus:outline-none focus:border-orange transition-colors"
            />
            <input
              name="devpostUrl"
              placeholder="Devpost"
              className="w-full border border-hairline bg-surface px-4 py-3 text-sm focus:outline-none focus:border-orange transition-colors"
            />
            <input
              name="interests"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="Interests, comma separated — robotics, compilers, climate"
              className="w-full border border-hairline bg-surface px-4 py-3 text-sm focus:outline-none focus:border-orange transition-colors"
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className="code text-slate mb-4">Your proof</legend>

          <label
            htmlFor="credentialImage"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file && fileRef.current) {
                const dt = new DataTransfer();
                dt.items.add(file);
                fileRef.current.files = dt.files;
                handleFile(file);
              }
            }}
            className="flex items-center gap-4 border border-dashed border-hairline bg-surface p-5 cursor-pointer hover:border-orange transition-colors"
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview.url}
                alt=""
                className="w-16 h-16 object-cover flex-shrink-0 border border-hairline"
              />
            ) : (
              <span className="w-16 h-16 flex-shrink-0 bg-concrete-deep flex items-center justify-center">
                <span className="display text-2xl text-slate">+</span>
              </span>
            )}
            <span className="min-w-0">
              <span className="block text-sm font-semibold">
                {preview ? preview.name : "Add your badge or YC Agent schedule"}
              </span>
              <span className="block text-xs text-slate mt-1 leading-relaxed">
                {preview
                  ? "Tap to replace"
                  : "Drop a screenshot, or tap to choose one. It stays private — only you and the check ever see it."}
              </span>
            </span>
          </label>
          <input
            ref={fileRef}
            id="credentialImage"
            type="file"
            name="credentialImage"
            accept="image/*"
            required
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="sr-only"
          />
        </fieldset>

        <fieldset>
          <legend className="code text-slate mb-1">After-parties</legend>
          <p className="text-xs text-slate mb-4 leading-relaxed">
            Optional. A party of forty is a much tighter room than a keynote of
            six thousand, so this is where the good matches come from.
          </p>

          <p className="code text-slate mb-2.5">Sunday</p>
          <div className="flex flex-wrap gap-1.5 mb-6">
            {DAY_2_PARTIES.map((p) => (
              <PartyToggle key={p.slug} slug={p.slug} label={p.name.replace("Day 2 · ", "")} />
            ))}
          </div>

          <details className="group">
            <summary className="code text-slate cursor-pointer hover:text-graphite transition-colors list-none">
              Saturday · {DAY_1_PARTIES.length} parties
              <span className="ml-2 group-open:hidden">+</span>
              <span className="ml-2 hidden group-open:inline">−</span>
            </summary>
            <div className="flex flex-wrap gap-1.5 pt-3">
              {DAY_1_PARTIES.map((p) => (
                <PartyToggle key={p.slug} slug={p.slug} label={p.name.replace("Day 1 · ", "")} />
              ))}
            </div>
          </details>
        </fieldset>

        {state === "rejected" && (
          <p className="text-sm border-l-2 border-orange bg-orange-wash px-4 py-3 leading-relaxed">
            {rejectionReason}
          </p>
        )}
        {state === "error" && (
          <div className="text-sm border-l-2 border-orange bg-orange-wash px-4 py-3">
            <p>That didn&apos;t go through. Try again.</p>
            {errorDetail && (
              <p className="mt-1.5 font-mono text-xs text-slate break-words">
                {errorDetail}
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={state === "submitting"}
          className="bg-orange text-white font-semibold px-8 py-4 hover:bg-orange-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state === "submitting" ? "Checking your badge…" : "Join the directory"}
        </button>
      </form>
    </main>
  );
}

function PartyToggle({ slug, label }: { slug: string; label: string }) {
  return (
    <label className="cursor-pointer">
      <input type="checkbox" name="afterParties" value={slug} className="peer sr-only" />
      <span className="inline-block border border-hairline bg-surface px-3 py-1.5 text-xs transition-colors peer-checked:bg-orange peer-checked:text-white peer-checked:border-orange peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-orange hover:border-slate">
        {label}
      </span>
    </label>
  );
}

function Field({
  label,
  name,
  placeholder,
}: {
  label: string;
  name: string;
  placeholder: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold mb-2">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        placeholder={placeholder}
        required
        rows={2}
        className="w-full border border-hairline bg-surface px-4 py-3 text-sm resize-none focus:outline-none focus:border-orange transition-colors"
      />
    </div>
  );
}
