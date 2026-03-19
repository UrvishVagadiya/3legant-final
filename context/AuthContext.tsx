"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: string | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Use a stable reference for the supabase client
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let mounted = true;

    const fetchRole = async (userId: string, initialUser: User | null = null) => {
      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", userId)
          .single();
        
        if (mounted) {
          if (error) {
            if (error.code === "PGRST116" && initialUser) {
              await supabase.from("user_profiles").insert({
                id: initialUser.id,
                email: initialUser.email,
                role: "user",
                full_name: initialUser.user_metadata?.full_name || "User",
                display_name: initialUser.user_metadata?.display_name || initialUser.email?.split("@")[0] || "User",
              });
              setRole("user");
              localStorage.setItem(`user-role-${userId}`, "user");
            } else {
              setRole("user");
            }
          } else {
            const fetchedRole = data?.role || "user";
            setRole(fetchedRole);
            localStorage.setItem(`user-role-${userId}`, fetchedRole);
          }
        }
      } catch (err) {
        if (mounted) {
          setRole("user");
        }
      }
    };

    // Use a single listener for all auth changes including initialization
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) return;
      
      const newUser = session?.user ?? null;
      setSession(session);
      setUser(newUser);
      
      if (newUser) {
        // Optimistically load role from cache
        const cachedRole = localStorage.getItem(`user-role-${newUser.id}`);
        if (cachedRole) {
          setRole(cachedRole);
        }
        
        // Fetch/Verify role in background
        fetchRole(newUser.id, session?.user ?? null);
      } else {
        setRole(null);
      }

      // Unblock UI immediately after session is resolved
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo(() => ({
    user,
    session,
    role,
    loading,
    isAuthenticated: !!user,
  }), [user, session, role, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
