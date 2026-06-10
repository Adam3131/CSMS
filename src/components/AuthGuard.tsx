"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "../utils/supabaseClient";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (mounted) {
        setSession(currentSession);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setSession(newSession);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthRoute = pathname === "/login" || pathname === "/register";
    const isPublicRoute = pathname === "/";
    const isProtectedRoute = !isAuthRoute && !isPublicRoute;

    if (isSupabaseConfigured) {
      if (session && isAuthRoute) {
        router.replace("/dashboard");
      } else if (!session && isProtectedRoute) {
        router.replace("/login");
      }
    }
  }, [session, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 font-sans">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-xs font-semibold">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const isPublicRoute = pathname === "/";
  const isProtectedRoute = !isAuthRoute && !isPublicRoute;

  if (isSupabaseConfigured) {
    if (!session && isProtectedRoute) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 font-sans">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-xs font-semibold">Redirecting to login...</p>
          </div>
        </div>
      );
    }
    if (session && isAuthRoute) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 font-sans">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-xs font-semibold">Redirecting to dashboard...</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
