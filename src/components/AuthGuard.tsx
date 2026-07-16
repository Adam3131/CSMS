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
  const [dbError, setDbError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
 
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
 
    let mounted = true;
    let subscription: any = null;
 
    // Get initial session with error handling
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(currentSession);
          setDbError(null);
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Supabase connection error:", err);
        if (mounted) {
          setDbError(err.message || "Failed to connect to the database.");
          setLoading(false);
        }
      }
    };
 
    checkSession();
 
    // Listen for auth changes
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
        if (mounted) {
          setSession(newSession);
          setLoading(false);
        }
      });
      subscription = data?.subscription;
    } catch (err) {
      console.warn("Failed to listen for auth changes:", err);
    }
 
    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [retryCount]);
 
  // Routing decisions are handled below using the local session marker.
  // Avoid auto-redirecting based solely on Supabase session to prevent
  // unexpected navigation when a Supabase token exists in localStorage.
 
  const handleRetry = () => {
    setDbError(null);
    setLoading(true);
    setRetryCount((prev) => prev + 1);
  };
 
  const handleEnterSimulation = () => {
    localStorage.setItem("csms_force_simulation", "true");
    window.location.reload();
  };
 
  if (dbError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 font-sans text-slate-900 p-6">
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-8 shadow-2xl">
          {/* Decorative glowing gradient backdrop */}
          <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-red-500/10 blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl"></div>
 
          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Warning Icon with pulse animation */}
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-650 ring-8 ring-red-50/50 mb-6 animate-pulse">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
 
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mb-2">
              Database Connection Failed
            </h1>
            <p className="text-sm leading-relaxed text-slate-500 mb-6">
              We couldn't connect to the Supabase security registry. The database project might be paused, or your local network connection could be restricted.
            </p>
 
            {/* Error detail drawer/disclosure */}
            <div className="w-full text-left bg-slate-50 rounded-xl border border-slate-100 p-4 mb-8">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Technical Details
              </span>
              <code className="text-xs text-red-650 font-mono break-all leading-normal">
                {dbError}
              </code>
            </div>
 
            {/* Action buttons */}
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={handleEnterSimulation}
                className="flex h-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-650 text-sm font-semibold text-white shadow-lg shadow-blue-500/15 transition-all hover:from-blue-500 hover:to-indigo-600 active:scale-[0.98] cursor-pointer"
              >
                Enter Simulation Mode (Offline)
              </button>
              <button
                onClick={handleRetry}
                className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] cursor-pointer"
              >
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
 
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
  const isPublicRoute = pathname === "/" || pathname.startsWith("/manager");
  const isProtectedRoute = !isAuthRoute && !isPublicRoute;
  // Use local storage session marker as the single source of truth for redirect decisions.
  const hasLocalSession = typeof window !== "undefined" && !!localStorage.getItem("csms_current_user");

  if (isProtectedRoute && !hasLocalSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 font-sans">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-xs font-semibold">Redirecting to login...</p>
        </div>
      </div>
    );
  }
 
  return <>{children}</>;
}
