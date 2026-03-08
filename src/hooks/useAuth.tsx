import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth(requireAuth = true) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Restore session from storage FIRST
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsReady(true);
    });

    // 2. Listen for subsequent auth changes (sign in/out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        // Only mark ready if not already ready
        setIsReady(true);

        // Only redirect on explicit sign-out, not on token refresh events
        if (event === "SIGNED_OUT" && requireAuth) {
          navigate("/login");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [requireAuth, navigate]);

  // Redirect to login only AFTER session is fully resolved and no user found
  useEffect(() => {
    if (isReady && !user && requireAuth) {
      navigate("/login");
    }
  }, [isReady, user, requireAuth, navigate]);

  return { user, loading: !isReady };
}
