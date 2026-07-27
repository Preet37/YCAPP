import Link from "next/link";
import { hasClerkKeys } from "@/lib/clerk-enabled";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="font-serif text-xl font-semibold">
          <span className="text-yc-orange">Batch</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/directory" className="hover:text-yc-orange transition-colors">
            Directory
          </Link>
          {hasClerkKeys ? (
            <>
              <Show when="signed-out">
                <SignInButton>
                  <button className="rounded-full bg-yc-orange text-white px-4 py-2 hover:bg-yc-orange-dark transition-colors">
                    Sign in
                  </button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <Link href="/onboarding" className="hover:text-yc-orange transition-colors">
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
