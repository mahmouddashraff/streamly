"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type AuthState = {
  user: User | null;
  role: "admin" | "user" | null;
  loading: boolean;
};

const AuthContext = createContext<AuthState>({
  user: null,
  role: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        if (isMounted) setState({ user: null, role: null, loading: false });
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (isMounted) {
        setState({
          user: session.user,
          role: (roleData?.role as "admin" | "user") || "user",
          loading: false,
        });
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (event === "INITIAL_SESSION") return; // Let fetchSession handle it
      if (event === "SIGNED_IN" && session?.user) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .single();
          
        if (isMounted) {
          setState({
            user: session.user,
            role: (roleData?.role as "admin" | "user") || "user",
            loading: false,
          });
        }
      } else if (event === "SIGNED_OUT") {
        if (isMounted) {
          setState({ user: null, role: null, loading: false });
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
