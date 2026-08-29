import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { getLocalAuthSession, clearLocalAuthSession } from "@/lib/localAuth";

// Builds a Supabase-shaped session from the local (Express/MySQL) JWT login,
// so pages that gate on useAuth()'s session/isAdmin keep working unchanged.
function buildLocalSession(): { user: User; session: Session; isAdmin: boolean } | null {
  const local = getLocalAuthSession();
  if (!local) return null;

  const user = {
    id: String(local.user.id),
    email: local.user.email,
    user_metadata: { name: local.user.name, must_change_password: false },
  } as unknown as User;

  const session = {
    access_token: local.token,
    token_type: "bearer",
    user,
  } as unknown as Session;

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

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setSession(session);
          setUser(session.user);
          setTimeout(() => {
            checkAdminRole(session.user.id);
          }, 0);
        } else {
          applyLocalSessionOrClear();
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        checkAdminRole(session.user.id);
      } else {
        applyLocalSessionOrClear();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (error) {
        console.error("Error checking admin role:", error);
        setIsAdmin(false);
      } else {
        setIsAdmin(!!data);
      }
    } catch (error) {
      console.error("Error checking admin role:", error);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Clear local state immediately
      setSession(null);
      setUser(null);
      setIsAdmin(false);

      // Clear the local (Express/MySQL) JWT session, if any
      clearLocalAuthSession();

      // Sign out from Supabase (global scope = invalidate all sessions)
      await supabase.auth.signOut({ scope: "global" });
    } catch (error) {
      console.error("Error during signOut:", error);
    } finally {
      // Force-clear any persisted Supabase auth tokens from storage
      try {
        Object.keys(localStorage)
          .filter((k) => k.startsWith("sb-") || k.includes("supabase.auth"))
          .forEach((k) => localStorage.removeItem(k));
        Object.keys(sessionStorage)
          .filter((k) => k.startsWith("sb-") || k.includes("supabase.auth"))
          .forEach((k) => sessionStorage.removeItem(k));
      } catch (e) {
        console.warn("Storage cleanup failed:", e);
      }
      // Hard reload to /auth to guarantee a fresh, unauthenticated app state
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
