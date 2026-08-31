import { useState, useEffect, useRef } from "react";
import { getLocalAuthSession, clearLocalAuthSession } from "@/lib/localAuth";

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    must_change_password?: boolean;
  };
}

export interface Session {
  access_token: string;
  token_type: string;
  user: User;
}

function buildLocalSession(): { user: User; session: Session; isAdmin: boolean } | null {
  const local = getLocalAuthSession();
  if (!local) return null;

  const user: User = {
    id: String(local.user.id),
    email: local.user.email,
    user_metadata: { name: local.user.name || undefined, must_change_password: false },
  };

  const session: Session = {
    access_token: local.token,
    token_type: "bearer",
    user,
  };

  return { user, session, isAdmin: local.user.role === "ADMIN" };
}

export const useAuth = () => {
  const [sessionData, setSessionData] = useState(() => buildLocalSession());
  const sessionDataRef = useRef(sessionData);
  sessionDataRef.current = sessionData;

  useEffect(() => {
    // Sync if localStorage changes in other tabs
    const handleStorage = () => {
      setSessionData(buildLocalSession());
    };
    window.addEventListener("storage", handleStorage);

    // Periodically check if session was cleared (uses ref to avoid stale closure)
    const interval = setInterval(() => {
      const current = getLocalAuthSession();
      if (!current && sessionDataRef.current) {
        setSessionData(null);
      }
    }, 5000);

    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []); // empty deps: only run once on mount

  const signOut = async () => {
    clearLocalAuthSession();
    setSessionData(null);
    window.location.replace("/auth");
  };

  return {
    user: sessionData?.user ?? null,
    session: sessionData?.session ?? null,
    isAdmin: sessionData?.isAdmin ?? false,
    isLoading: false,
    signOut,
  };
};

