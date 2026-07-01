"use client";

import React from "react";
import Link from "next/link";
import { DocumentItem } from "../utils/documentStore";
import { getCurrentUser, logout, getRoleDetails, createUser, UserRole } from "../utils/userStore";

interface SidebarProps {
  currentPath: string;
  selectedCategory?: string;
  documents: DocumentItem[];
}

export default function Sidebar({ currentPath, selectedCategory = "All", documents }: SidebarProps) {
  const [isSimulated, setIsSimulated] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState({
    email: "putri.fatima@pertamina.com",
    role: "Admin" as UserRole,
    fullName: "PUTRI FATIMA SUNNIA",
  });

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [modalEmail, setModalEmail] = React.useState("");
  const [modalFullName, setModalFullName] = React.useState("");
  const [modalPassword, setModalPassword] = React.useState("");
  const [modalRole, setModalRole] = React.useState<UserRole>("User");
  const [modalError, setModalError] = React.useState("");
  const [modalSuccess, setModalSuccess] = React.useState("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setIsSimulated(localStorage.getItem("csms_force_simulation") === "true");
    }
    
    // Set initial user session
    setCurrentUser(getCurrentUser());

    // Listen to session changes
    const handleSessionChange = () => {
      setCurrentUser(getCurrentUser());
    };
    
    const handleOpenModal = () => {
      setModalError("");
      setModalSuccess("");
      setModalEmail("");
      setModalFullName("");
      setModalPassword("");
      setModalRole("User");
      setIsCreateModalOpen(true);
    };
    
    window.addEventListener("user-session-changed", handleSessionChange);
    window.addEventListener("open-create-user-modal", handleOpenModal);
    return () => {
      window.removeEventListener("user-session-changed", handleSessionChange);
      window.removeEventListener("open-create-user-modal", handleOpenModal);
    };
  }, []);

  const handleReconnect = () => {
    localStorage.removeItem("csms_force_simulation");
    window.location.reload();
  };

  // We can calculate stats from the documents array
  const stats = React.useMemo(() => {
    return {
      total: documents.length,
      hsePlan: documents.filter((d) => d.type === "HSE Plan").length,
      pja: documents.filter((d) => d.type === "PJA").length,
      wip: documents.filter((d) => d.type === "WIP").length,
      fe: documents.filter((d) => d.type === "FE").length,
    };
  }, [documents]);

  const recentDocuments = React.useMemo(() => {
    // Show top 7 documents for the recent list
    return documents.slice(0, 7);
  }, [documents]);

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    setModalSuccess("");

    if (!modalEmail.trim() || !modalFullName.trim() || !modalPassword) {
      setModalError("All fields are required.");
      return;
    }

    if (!modalEmail.includes("@")) {
      setModalError("Please enter a valid email address.");
      return;
    }

    if (modalPassword.length < 6) {
      setModalError("Password must be at least 6 characters.");
      return;
    }

    const result = createUser(modalEmail, modalRole, modalFullName, modalPassword);
    if (!result) {
      setModalError("A user with this email already exists.");
    } else {
      setModalSuccess("User created successfully!");
      // Reset inputs after delay and close modal
      setTimeout(() => {
        setIsCreateModalOpen(false);
        setModalEmail("");
        setModalFullName("");
        setModalPassword("");
        setModalRole("User");
        setModalSuccess("");
      }, 1000);
    }
  };

  // Dynamic user data variables
  const roleDetails = getRoleDetails(currentUser.role);
  const initials = currentUser.fullName
    ? currentUser.fullName
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "US";

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-20 flex w-72 flex-col border-r border-slate-200/80 bg-[#e9ecfa] p-4 font-sans select-none">
        {/* App Logo */}
        <div className="flex h-14 items-center gap-2.5 px-4 mb-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-sm">
            C
          </span>
          <span className="text-base font-bold tracking-tight text-slate-800">
            CSMS Portal
          </span>
        </div>

        {/* Navigation list */}
        <div className="flex flex-1 flex-col overflow-y-auto px-1 py-2 space-y-6">
          {/* Home & My Task */}
          <div className="space-y-2">
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                currentPath === "/" || (currentPath === "/dashboard" && selectedCategory === "All")
                  ? "bg-white text-slate-800 shadow-sm"
                  : "bg-white/40 text-slate-600 hover:bg-white/70 hover:text-slate-800"
              }`}
            >
              <svg className="h-4.5 w-4.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              My Task
            </Link>
          </div>

          {/* Main Menu (renamed from Documents) */}
          <div className="space-y-2">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Main Menu
            </p>
            {[
              { id: "HSE Plan", name: "HSE Plan", link: "/hse-plan" },
              { id: "PJA", name: "P.J.A", link: "/pje" },
              { id: "WIP", name: "W.I.P", link: "/wip" },
              { id: "FE", name: "F.E", link: "/fe" },
            ].map((cat) => {
              const isHsePlanRoute = cat.id === "HSE Plan" && (currentPath === "/hse-plan" || currentPath === "/hse-plan/create");
              const isPjaRoute = cat.id === "PJA" && (currentPath === "/pje" || currentPath === "/pje/create");
              const isWipRoute = cat.id === "WIP" && (currentPath === "/wip" || currentPath === "/wip/create");
              const isFeRoute = cat.id === "FE" && (currentPath === "/fe" || currentPath === "/fe/create");
              const isDashboardCategory = currentPath === "/dashboard" && selectedCategory === cat.id;
              const isActive = isHsePlanRoute || isPjaRoute || isWipRoute || isFeRoute || isDashboardCategory;

              return (
                <Link
                  key={cat.id}
                  href={cat.link}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                    isActive
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                      : "bg-white/40 text-slate-600 hover:bg-white/70 hover:text-slate-800"
                  }`}
                >
                  <svg className="h-4.5 w-4.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {cat.name}
                </Link>
              );
            })}
          </div>

          {/* Administration Section */}
          <div className="space-y-2">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Administration
            </p>
            <Link
              href="/dashboard/users"
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                currentPath === "/dashboard/users"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                  : "bg-white/40 text-slate-600 hover:bg-white/70 hover:text-slate-800"
              }`}
            >
              <svg className="h-4.5 w-4.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              User Management
            </Link>
            <button
              onClick={() => {
                setModalError("");
                setModalSuccess("");
                setModalEmail("");
                setModalFullName("");
                setModalPassword("");
                setModalRole("User");
                setIsCreateModalOpen(true);
              }}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold transition-all bg-white/40 text-slate-600 hover:bg-white/70 hover:text-slate-800 text-left cursor-pointer"
            >
              <svg className="h-4.5 w-4.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Create User
            </button>
          </div>

          {/* Recent */}
          <div className="space-y-2">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Recent
            </p>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {recentDocuments.map((doc) => (
                <Link
                  key={doc.no}
                  href={`/dashboard?search=${encodeURIComponent(doc.nama)}`}
                  className="block w-full text-left truncate text-[11px] bg-white/40 text-slate-700 hover:bg-white/70 hover:text-slate-900 rounded-lg px-3.5 py-2 transition-all font-semibold"
                  title={doc.nama}
                >
                  {doc.nama}
                </Link>
              ))}
            </div>
            <button
              onClick={() => window.location.href = "/dashboard"}
              className="px-3 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              more...
            </button>
          </div>
        </div>

        {/* Offline Alert Badge */}
        {isSimulated && (
          <div className="mt-auto mb-4 rounded-xl border border-amber-250 bg-amber-50 p-3 shadow-sm">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-800">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                Offline Simulation Mode
              </div>
              <p className="text-[9px] text-amber-600/90 leading-normal font-medium">
                Running with local simulated database because the main registry was unreachable.
              </p>
              <button
                onClick={handleReconnect}
                className="w-full rounded-lg bg-amber-600/90 py-1.5 text-center text-[9px] font-bold text-white transition-all hover:bg-amber-600 active:scale-[0.98] cursor-pointer"
              >
                Reconnect to Database
              </button>
            </div>
          </div>
        )}

        {/* User profile footer info */}
        <div className={`border-t border-slate-200/60 pt-4 ${!isSimulated ? "mt-auto" : "mt-2"}`}>
          <div className="flex items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-850" title={currentUser.fullName}>
                  {currentUser.fullName}
                </p>
                <p className="truncate text-[10px] text-slate-400 font-semibold" title={currentUser.email}>
                  {currentUser.email}
                </p>
              </div>
            </div>
            {/* Sign Out Button */}
            <button
              onClick={() => logout()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer shrink-0"
              title="Sign Out"
            >
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
          <div className="mt-2 text-[9px] font-bold text-slate-400 px-1 truncate" title={`${roleDetails.position} (${roleDetails.department})`}>
            {roleDetails.position}
          </div>
        </div>
      </aside>

      {/* CREATE USER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative bg-white w-full max-w-md rounded-2xl border border-slate-200/80 p-6 shadow-2xl animate-fade-in text-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Create New User
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateUserSubmit} className="mt-4 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg flex items-center gap-2">
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {modalError}
                </div>
              )}

              {modalSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-lg flex items-center gap-2">
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {modalSuccess}
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={modalFullName}
                  onChange={(e) => setModalFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">Email Address</label>
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={modalEmail}
                  onChange={(e) => setModalEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={modalPassword}
                  onChange={(e) => setModalPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                  required
                />
              </div>

              {/* Role Dropdown */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">Role</label>
                <select
                  value={modalRole}
                  onChange={(e) => setModalRole(e.target.value as UserRole)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none bg-white transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                >
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
                  <option value="Manajer">Manajer</option>
                  <option value="Procurement">Procurement</option>
                </select>
              </div>

              {/* Footer Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-center text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-[0.98] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 py-2.5 text-center text-xs font-bold text-white shadow-md shadow-blue-500/10 hover:from-blue-500 hover:to-indigo-500 transition-all active:scale-[0.98] cursor-pointer"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
