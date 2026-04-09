"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Supabase magic link lands here as:
// localhost:3000/#access_token=...&token_type=bearer&...
// The fragment is only readable client-side.

export default function AuthCallbackPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [status, setStatus] = useState<"processing" | "error">("processing");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Supabase can deliver errors via query string (e.g. disallowed redirect) or
    // the access token via the URL fragment (implicit flow).
    const queryParams = new URLSearchParams(window.location.search);
    const queryError =
      queryParams.get("error_description") ?? queryParams.get("error");

    if (queryError) {
      setStatus("error");
      setErrorMsg(decodeURIComponent(queryError));
      return;
    }

    const hash = window.location.hash.substring(1); // remove leading #
    const params = new URLSearchParams(hash);

    const accessToken = params.get("access_token");
    const tokenType = params.get("token_type");
    const errorParam = params.get("error_description") ?? params.get("error");

    if (errorParam) {
      setStatus("error");
      setErrorMsg(decodeURIComponent(errorParam));
      return;
    }

    if (accessToken && tokenType === "bearer") {
      // expires_at is a Unix timestamp (seconds); convert to ISO string for storage.
      const expiresAtRaw = params.get("expires_at");
      const expiresAt = expiresAtRaw
        ? new Date(parseInt(expiresAtRaw, 10) * 1000).toISOString()
        : undefined;
      signIn(accessToken, expiresAt);
      router.replace("/");
      return;
    }

    setStatus("error");
    setErrorMsg("No access token found in the link. Please request a new sign-in link.");
  }, [signIn, router]);

  return (
    <div className="min-h-screen bg-dome-bg-primary flex items-center justify-center px-6">
      <div className="max-w-sm w-full bg-dome-bg-secondary border border-dome-border rounded-dome p-8 text-center">
        {status === "processing" ? (
          <>
            <div className="flex justify-center mb-4">
              <span className="w-6 h-6 border-2 border-dome-accent-cyan border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="font-mono text-[11px] uppercase tracking-dome text-dome-accent-cyan mb-2">
              Signing in
            </p>
            <p className="font-body text-sm text-dome-text-muted">
              Verifying your sign-in link…
            </p>
          </>
        ) : (
          <>
            <p className="font-mono text-[11px] uppercase tracking-dome text-dome-status-critical mb-2">
              Sign-in failed
            </p>
            <p className="font-body text-sm text-dome-text-muted mb-6">{errorMsg}</p>
            <a
              href="/"
              className="font-mono text-[11px] uppercase tracking-dome text-dome-accent-cyan underline underline-offset-4"
            >
              Return home
            </a>
          </>
        )}
      </div>
    </div>
  );
}
