"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "../../../components/Sidebar";
import { DocumentItem, getDocuments } from "../../../utils/documentStore";
import {
  getUsers,
  deleteUser,
  getCurrentUser,
  getRoleDetails,
  UserItem,
  UserRole,
} from "../../../utils/userStore";

export default function UserManagementPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [currentUser, setCurrentUser] = useState({
    email: "putri.fatima@pertamina.com",
    role: "Admin" as UserRole,
    fullName: "PUTRI FATIMA SUNNIA",
  });

  // Load data on mount
  useEffect(() => {
    setIsMounted(true);
    getDocuments().then(setDocuments);
    setUsers(getUsers());
    setCurrentUser(getCurrentUser());

    // Listen to when new users are created or deleted
    const handleUsersChanged = () => {
      setUsers(getUsers());
    };

    // Listen to session changes
    const handleSessionChange = () => {
      setCurrentUser(getCurrentUser());
    };

    window.addEventListener("user-created", handleUsersChanged);
    window.addEventListener("user-session-changed", handleSessionChange);

    return () => {
      window.removeEventListener("user-created", handleUsersChanged);
      window.removeEventListener("user-session-changed", handleSessionChange);
    };
  }, []);

  const handleDeleteUser = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete user "${name}"?`)) {
      const success = deleteUser(id);
      if (!success) {
        alert("Failed to delete user. The default administrator cannot be deleted.");
      }
    }
  };

  const handleOpenCreateModal = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("open-create-user-modal"));
    }
  };

  if (!isMounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 font-sans">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-xs font-semibold">Loading Users Directory...</p>
        </div>
      </div>
    );
  }

  // Active user details
  const activeRoleDetails = getRoleDetails(currentUser.role);
  const activeInitials = currentUser.fullName
    ? currentUser.fullName
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "US";

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* 1. SIDEBAR */}
      <Sidebar currentPath="/dashboard/users" documents={documents} />

      {/* 2. MAIN LAYOUT CONTAINER */}
      <div className="flex flex-1 flex-col pl-72">
        
        {/* Sticky Header */}
        <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-200/60 bg-white/85 px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-tight text-slate-800">
              User Management
            </h1>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold text-slate-500">
              Directory List
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-800">{currentUser.fullName}</p>
              <p className="text-[10px] font-medium text-slate-400">{activeRoleDetails.position}</p>
            </div>
            <div className="h-9 w-9 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs shadow-inner">
              {activeInitials}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-8 space-y-6 max-w-7xl w-full mx-auto animate-fade-in">
          
          {/* Section Heading & Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Users Accounts Registry</h2>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Manage registered profiles, assign access roles, and provision new user credentials.
              </p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/10 hover:from-blue-500 hover:to-indigo-500 transition-all active:scale-[0.98] cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New User
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Users</p>
                <p className="text-2xl font-extrabold text-slate-800 mt-1">{users.length}</p>
              </div>
              <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Administrators</p>
                <p className="text-2xl font-extrabold text-slate-800 mt-1">
                  {users.filter(u => u.role === "Admin").length}
                </p>
              </div>
              <div className="h-10 w-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">HSSE Managers</p>
                <p className="text-2xl font-extrabold text-slate-800 mt-1">
                  {users.filter(u => u.role === "Manajer").length}
                </p>
              </div>
              <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Procurements</p>
                <p className="text-2xl font-extrabold text-slate-800 mt-1">
                  {users.filter(u => u.role === "Procurement").length}
                </p>
              </div>
              <div className="h-10 w-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/50 text-[10px] font-bold uppercase tracking-wider text-slate-450">
                    <th className="px-6 py-4">User Information</th>
                    <th className="px-6 py-4">Access Role</th>
                    <th className="px-6 py-4">Position / Department</th>
                    <th className="px-6 py-4">Provisioned Date</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {users.map((u) => {
                    const roleDetails = getRoleDetails(u.role);
                    const userInitials = u.fullName
                      ? u.fullName
                          .split(" ")
                          .filter(Boolean)
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : "US";
                    
                    const joinedDate = new Date(u.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* User Profile */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 border border-slate-200/80 font-bold text-slate-600 text-xs">
                              {userInitials}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{u.fullName}</p>
                              <p className="text-[10px] font-medium text-slate-400 mt-0.5">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${roleDetails.colorClass}`}>
                            <span className="h-1 w-1 rounded-full bg-current mr-1.5" />
                            {roleDetails.roleLabel}
                          </span>
                        </td>

                        {/* Department/Position */}
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-xs font-bold text-slate-700">{roleDetails.position}</p>
                            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{roleDetails.department}</p>
                          </div>
                        </td>

                        {/* Provisioned Date */}
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-slate-500">{joinedDate}</span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-center">
                          {u.email === "putri.fatima@pertamina.com" ? (
                            <span className="text-[10px] font-bold text-slate-300 italic select-none">
                              System Default
                            </span>
                          ) : (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.fullName)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-red-50/30 text-red-500 transition-all hover:bg-red-50 hover:border-red-200 active:scale-95 cursor-pointer"
                              title="Delete user"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
