import { useState, useEffect } from "react";
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const applyLocalSessionOrClear = () => {
      const local = buildLocalSession();
      if (local) {
        setSession(local.session);
        setUser(local.user);
        setIsAdmin(local.isAdmin);
      } else {
        setSession(null);
        setUser(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    };

    applyLocalSessionOrClear();
    
    // Periodically check if session was cleared (e.g., in another tab)
    const interval = setInterval(() => {
      const currentLocal = getLocalAuthSession();
      if (!currentLocal && session) {
        applyLocalSessionOrClear();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [session]);

  const signOut = async () => {
    try {
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      clearLocalAuthSession();
    } catch (error) {
      console.error("Error during signOut:", error);
    } finally {
      window.location.replace("/auth");
    }
  };

  return {
    user,
    session,
    isAdmin,
    isLoading,
    signOut,
  };
};
