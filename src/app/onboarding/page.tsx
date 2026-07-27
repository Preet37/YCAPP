"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AFTER_PARTIES } from "@/lib/event-catalog";

const DAY_2_PARTIES = AFTER_PARTIES.filter((p) => p.day === 2);
const DAY_1_PARTIES = AFTER_PARTIES.filter((p) => p.day === 1);

type SubmitState = "idle" | "submitting" | "rejected" | "error";

export default function OnboardingPage() {
  const router = useRouter();
  const [state, setState] = useState<SubmitState>("idle");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");
    setRejectionReason(null);

    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/onboarding", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      router.push("/directory");
      return;
    }

    if (res.status === 422) {
      const data = await res.json();
      setState("rejected");
      setRejectionReason(data.reason ?? "We couldn't verify that credential.");
      return;
    }

    setState("error");
  }

  return (
    <main className="flex-1 max-w-xl mx-auto w-full px-6 py-12">
      <h1 className="font-serif text-3xl font-medium mb-2">
        Tell us who you are
      </h1>
      <p className="text-muted mb-8">
        Two questions, one photo. That&apos;s it.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Field
          label="What are you building?"
          name="buildingText"
          placeholder="An AI copilot for radiologists"
        />
        <Field
          label="Who do you need to meet?"
          name="lookingForText"
          placeholder="A technical cofounder with ML infra experience"
        />
        <Field label="Your LinkedIn URL" name="linkedinUrl" placeholder="https://linkedin.com/in/you" />

        <div>
          <label className="block text-sm font-medium mb-2">
            Upload your badge or YC Agent schedule screenshot
          </label>
          <input
            type="file"
            name="credentialImage"
            accept="image/*"
            required
            className="block w-full text-sm border border-border rounded-xl p-3 file:mr-3 file:rounded-full file:border-0 file:bg-yc-orange file:text-white file:px-4 file:py-2 file:font-medium"
          />
          <p className="text-xs text-muted mt-1.5">
            This is how we verify you actually attended — no YC API needed.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Which after-parties are you at?
          </label>
          <p className="text-xs text-muted mb-3">
            Optional, but it&apos;s the fastest way to find people you can actually
            walk up to tonight.
          </p>

          <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
            Tonight
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {DAY_2_PARTIES.map((p) => (
              <PartyToggle key={p.slug} slug={p.slug} label={p.name.replace("Day 2 · ", "")} />
            ))}
          </div>

          <details>
            <summary className="text-xs font-semibold uppercase tracking-wide text-muted cursor-pointer mb-2">
              Last night ({DAY_1_PARTIES.length})
            </summary>
            <div className="flex flex-wrap gap-2 pt-2">
              {DAY_1_PARTIES.map((p) => (
                <PartyToggle key={p.slug} slug={p.slug} label={p.name.replace("Day 1 · ", "")} />
              ))}
            </div>
          </details>
        </div>

        {state === "rejected" && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {rejectionReason}
          </p>
        )}
        {state === "error" && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            Something went wrong. Try again.
          </p>
        )}

        <button
          type="submit"
          disabled={state === "submitting"}
          className="rounded-full bg-yc-orange text-white font-semibold px-8 py-3 hover:bg-yc-orange-dark transition-colors disabled:opacity-60"
        >
          {state === "submitting" ? "Verifying…" : "Join the directory"}
        </button>
      </form>
    </main>
  );
}

function PartyToggle({ slug, label }: { slug: string; label: string }) {
  return (
    <label className="cursor-pointer">
      <input
        type="checkbox"
        name="afterParties"
        value={slug}
        className="peer sr-only"
      />
      <span className="inline-block rounded-full border border-border px-3.5 py-1.5 text-sm transition-colors peer-checked:bg-yc-orange peer-checked:text-white peer-checked:border-yc-orange hover:border-yc-orange/60">
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
      <label className="block text-sm font-medium mb-2">{label}</label>
      <textarea
        name={name}
        placeholder={placeholder}
        required
        rows={2}
        className="w-full border border-border rounded-xl p-3 bg-card focus:outline-none focus:ring-2 focus:ring-yc-orange/40"
      />
    </div>
  );
}
