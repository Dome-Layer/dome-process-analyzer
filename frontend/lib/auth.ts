const TOKEN_KEY = "dome_access_token";
const EXPIRES_KEY = "dome_token_expires_at";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  const expiresAt = localStorage.getItem(EXPIRES_KEY);
  if (expiresAt && new Date(expiresAt) < new Date()) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRES_KEY);
    return null;
  }
  return token;
}

export function setToken(token: string, expiresAt?: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  if (expiresAt) {
    localStorage.setItem(EXPIRES_KEY, expiresAt);
  }
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRES_KEY);
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
