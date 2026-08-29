import type { BackendUser } from "@/lib/api";

const STORAGE_KEY = "backend_auth";

export interface LocalAuthSession {
  token: string;
  user: BackendUser;
}

export function getLocalAuthSession(): LocalAuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LocalAuthSession) : null;
  } catch {
    return null;
  }
}

export function setLocalAuthSession(session: LocalAuthSession) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearLocalAuthSession() {
  localStorage.removeItem(STORAGE_KEY);
}
