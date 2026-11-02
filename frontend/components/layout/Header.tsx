"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ToolHeader } from "@dome-layer/dome-ui";
import { AuthModal } from "@/components/auth/AuthModal";
import { useT } from "@/lib/i18n";

export function Header() {
  const [authOpen, setAuthOpen] = useState(false);
  const pathname = usePathname();
  const t = useT();

  return (
    <>
      <ToolHeader
        toolName="Process Analyzer"
        width="contained"
        navLinks={[{ label: t.nav.saved, href: "/saved" }]}
        languages
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
