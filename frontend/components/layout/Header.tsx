"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ToolHeader } from "@dome-layer/dome-ui";
import { AuthModal } from "@/components/auth/AuthModal";

export function Header() {
  const [authOpen, setAuthOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <ToolHeader
        toolName="Process Analyzer"
        width="contained"
        navLinks={[{ label: "Saved", href: "/saved" }]}
        currentPath={pathname ?? undefined}
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
