"use client";

import { supabase, isSupabaseConfigured } from "./supabaseClient";

export type UserRole = "Admin" | "User" | "Manajer" | "Procurement";

export interface UserItem {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  password?: string;
  createdAt: string;
}

export interface UserSession {
  email: string;
  role: UserRole;
  fullName: string;
}

const CURRENT_USER_KEY = "csms_current_user";

export async function getUsers(): Promise<UserItem[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching profiles:", error.message);
      return [];
    }

    return (data || []).map((profile) => ({
      id: profile.id,
      email: profile.full_name
        ? `${profile.full_name.replace(/\s+/g, ".").toLowerCase()}@supabase.local`
        : `${profile.id}@supabase.local`,
      fullName: profile.full_name || "Unnamed Profile",
      role: (profile.role as UserRole) || "User",
      createdAt: profile.updated_at || new Date().toISOString(),
    }));
  } catch (e) {
    console.error("Unexpected error fetching users:", e);
    return [];
  }
}

export async function createUser(
  email: string,
  role: UserRole,
  fullName: string,
  password?: string
): Promise<UserItem | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password: password || "password",
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (error) {
      console.error("Supabase sign-up failed", error);
      return null;
    }

    const newUser: UserItem = {
      id: data.user?.id || `user-${Math.random().toString(36).slice(2, 11)}`,
      email: email.toLowerCase(),
      role,
      fullName,
      password: password || "password",
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("user-created"));
    }

    return newUser;
  } catch (err) {
    console.error("Unexpected Supabase sign-up error", err);
    return null;
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete profile from Supabase:", error.message);
      return false;
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("user-created"));
    }
    return true;
  } catch (e) {
    console.error("Unexpected error deleting user:", e);
    return false;
  }
}

export async function updateUser(
  id: string,
  email: string,
  role: UserRole,
  fullName: string,
  password?: string
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Failed to update profile in Supabase:", error.message);
      return false;
    }

    const currentUser = getCurrentUser();
    if (currentUser && currentUser.email.toLowerCase() === email.toLowerCase()) {
      setCurrentUser({
        ...currentUser,
        role,
        fullName,
      });
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("user-created"));
    }
    return true;
  } catch (e) {
    console.error("Unexpected error updating user:", e);
    return false;
  }
}

export function getCurrentUser(): UserSession | null {
  if (typeof window !== "undefined") {
    const session = localStorage.getItem(CURRENT_USER_KEY);
    if (session) {
      try {
        return JSON.parse(session);
      } catch (e) {
        // ignore
      }
    }
  }
  return null;
}

export function setCurrentUser(user: UserSession | null): void {
  if (typeof window !== "undefined") {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
    // Dispatch session change event
    window.dispatchEvent(new Event("user-session-changed"));
  }
}

export function logout(): void {
  setCurrentUser(null);
  if (isSupabaseConfigured) {
    supabase.auth.signOut().catch((err) => {
      console.error("Supabase signOut error:", err);
    });
  }
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

export function getRoleDetails(role: UserRole) {
  switch (role) {
    case "Admin":
      return {
        roleLabel: "Admin",
        department: "Environmental & HSSE Governance",
        position: "HSSE Governance Officer",
        colorClass: "bg-red-50 text-red-700 ring-red-700/10 border-red-200",
      };
    case "Procurement":
      return {
        roleLabel: "Procurement",
        department: "Procurement & Logistics",
        position: "Procurement Officer",
        colorClass: "bg-blue-50 text-blue-700 ring-blue-700/10 border-blue-200",
      };
    case "Manajer":
      return {
        roleLabel: "Manajer",
        department: "HSSE Department",
        position: "HSSE Manager",
        colorClass: "bg-purple-50 text-purple-700 ring-purple-700/10 border-purple-200",
      };
    case "User":
    default:
      return {
        roleLabel: "User",
        department: "Operations Department",
        position: "Operations Staff",
        colorClass: "bg-green-50 text-green-700 ring-green-700/10 border-green-200",
      };
  }
}
