"use client";

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

const USERS_STORAGE_KEY = "csms_users";
const CURRENT_USER_KEY = "csms_current_user";

export const DEFAULT_USERS: UserItem[] = [
  {
    id: "user-1",
    email: "putri.fatima@pertamina.com",
    fullName: "PUTRI FATIMA SUNNIA",
    role: "Admin",
    password: "password",
    createdAt: new Date("2026-01-15").toISOString(),
  },
  {
    id: "user-2",
    email: "procurement@pertamina.com",
    fullName: "PROCUREMENT OFFICER",
    role: "Procurement",
    password: "password",
    createdAt: new Date("2026-02-20").toISOString(),
  },
  {
    id: "user-3",
    email: "manager@pertamina.com",
    fullName: "HSSE MANAGER",
    role: "Manajer",
    password: "password",
    createdAt: new Date("2026-03-10").toISOString(),
  },
  {
    id: "user-4",
    email: "user@pertamina.com",
    fullName: "OPERATIONS USER",
    role: "User",
    password: "password",
    createdAt: new Date("2026-04-05").toISOString(),
  },
];

export function getUsers(): UserItem[] {
  if (typeof window === "undefined") {
    return DEFAULT_USERS;
  }
  const stored = localStorage.getItem(USERS_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Error parsing users from localStorage", e);
    return DEFAULT_USERS;
  }
}

export function saveUsers(users: UserItem[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }
}

export function createUser(
  email: string,
  role: UserRole,
  fullName: string,
  password?: string
): UserItem | null {
  const users = getUsers();
  
  // Check if email already exists
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return null;
  }

  const newUser: UserItem = {
    id: "user-" + Math.random().toString(36).substr(2, 9),
    email: email.toLowerCase(),
    role,
    fullName,
    password: password || "password",
    createdAt: new Date().toISOString(),
  };

  const updatedUsers = [...users, newUser];
  saveUsers(updatedUsers);

  // Dispatch custom event to notify other components (like the user table)
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("user-created"));
  }

  return newUser;
}

export function deleteUser(id: string): boolean {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return false;

  // Don't allow deleting the default active admin putri.fatima@pertamina.com to prevent lockouts
  if (users[index].email === "putri.fatima@pertamina.com") {
    return false;
  }

  const updatedUsers = users.filter((u) => u.id !== id);
  saveUsers(updatedUsers);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("user-created"));
  }
  return true;
}

export function getCurrentUser(): UserSession {
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
  return {
    email: "putri.fatima@pertamina.com",
    role: "Admin",
    fullName: "PUTRI FATIMA SUNNIA",
  };
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
