"use client";

import Link from "next/link";
import { DomeLogo } from "./DomeLogo";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { AuthModal } from "@/components/auth/AuthModal";
import { getAuthSiteUrl } from "@/lib/auth";

export function Header() {
  const { isAuthenticated, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <header className="site-header sticky top-0 z-40">
        <div className="max-w-[1152px] mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" aria-label="Home">
            <DomeLogo width={100} />
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              href="/saved"
              className="font-sans text-sm font-medium text-dome-text-secondary hover:text-dome-accent transition-colors duration-150"
            >
              Saved
            </Link>

            {isAuthenticated ? (
              <button
                onClick={async () => {
                  await signOut();
                  window.location.href = `${getAuthSiteUrl()}/login`;
                }}
                className="btn btn-neutral"
              >
                Sign out
              </button>
            ) : (
              <Button variant="primary" onClick={() => setAuthOpen(true)}>
                Sign in
              </Button>
            )}

            <ThemeToggle />
          </nav>
        </div>
      </header>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}
