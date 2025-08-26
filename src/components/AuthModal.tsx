// src/hooks/useAuth.ts
import { useState } from "react";
import { supabase } from "../supabaseClient";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ Sign Up
  const signUp = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      setUser(data.user);
      return data;
    } catch (err: any) {
      setError(err.message);
      console.error("Sign up error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Sign In
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setUser(data.user);
      return data;
    } catch (err: any) {
      setError(err.message);
      console.error("Sign in error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Sign Out
  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err: any) {
      console.error("Sign out error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    error,
    loading,
    signUp,
    signIn,
    signOut,
  };
}
