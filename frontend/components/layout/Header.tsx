"use client";

import Link from "next/link";
import { useState } from "react";
import { ToolHeader } from "@dome-layer/dome-ui";
import { AuthModal } from "@/components/auth/AuthModal";

export function Header() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <ToolHeader
        toolName="Process Analyzer"
        width="contained"
        navLinks={[{ label: "Saved", href: "/saved" }]}
        renderLink={({ href, children, ...rest }) => (
          <Link href={href} {...rest}>
            {children}
          </Link>
        )}
        onSignIn={() => setAuthOpen(true)}
      />
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}
