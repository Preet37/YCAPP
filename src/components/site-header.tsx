import Link from "next/link";
import { hasClerkKeys } from "@/lib/clerk-enabled";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-concrete/85 backdrop-blur-md border-b border-hairline">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-14">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="w-6 h-6 bg-orange flex items-center justify-center">
            <span className="display text-white text-sm leading-none">B</span>
          </span>
          <span className="code text-graphite">Batch</span>
        </Link>

        <nav className="flex items-center gap-5">
          <Link
            href="/directory"
            className="code text-slate hover:text-graphite transition-colors py-2"
          >
            Directory
          </Link>
          {hasClerkKeys ? (
            <>
              <Show when="signed-out">
                <SignInButton>
                  <button className="code bg-graphite text-concrete px-3.5 py-2 hover:bg-orange transition-colors">
                    Sign in
                  </button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <Link
                  href="/onboarding"
                  className="code text-slate hover:text-graphite transition-colors"
                >
                  My profile
                </Link>
                <UserButton />
              </Show>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
