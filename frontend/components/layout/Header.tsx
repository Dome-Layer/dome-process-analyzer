"use client";

import Link from "next/link";
import { DomeLogo } from "./DomeLogo";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { AuthModal } from "@/components/auth/AuthModal";

export function Header() {
  const { isAuthenticated, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-dome-bg-secondary/90 backdrop-blur-sm border-b border-dome-border">
        <div className="max-w-[1152px] mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" aria-label="Home">
            <DomeLogo width={100} />
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/saved"
              className="font-mono text-[13px] font-medium uppercase tracking-dome text-dome-text-secondary hover:text-dome-accent-cyan transition-colors duration-200"
            >
              Saved
            </Link>

            {isAuthenticated ? (
              <Button variant="secondary" onClick={() => signOut()}>
                Sign out
              </Button>
            ) : (
              <Button variant="primary" onClick={() => setAuthOpen(true)}>
                Sign in
              </Button>
            )}
          </nav>
        </div>
      </header>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}
