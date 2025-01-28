import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import Toaster from "../utils/toasterConfig";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        Toaster({
          type: "success",
          text1: "Welcome",
          text2: `Hello, ${session.user.user_metadata.name || "User"}!`,
          position: "top",
          topOffset: 50,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Invalid email or password");
        }
        throw error;
      }

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          skipBrowserRedirect: false,
          redirectTo: "http://localhost:8081/home",
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("OAuth error:", error);
        throw error;
      }

      return { error: null };
    } catch (error: any) {
      console.error("Google sign in error:", error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      Toaster({
        type: "success",
        text1: "Signed out",
        text2: "Come back soon!",
      });

      return { error: null };
    } catch (error: any) {
      Toaster({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
      return { error };
    }
  };

  return {
    user,
    session,
    loading,
    signInWithEmail,
    signInWithGoogle,
    signOut,
  };
}
