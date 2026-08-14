"use client";

import React, { useState, useEffect } from "react";
import { updateUser, UserRole, UserItem } from "../utils/userStore";

interface EditUserModalProps {
  isOpen: boolean;
  user: UserItem | null;
  onClose: () => void;
}

export default function EditUserModal({ isOpen, user, onClose }: EditUserModalProps) {
  const [formValues, setFormValues] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormValues({
        fullName: user.fullName || "",
        email: user.email || "",
        password: user.password || "password",
        role: user.role || "User",
      });
      setError("");
      setSuccess("");
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleChange = (field: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { fullName, email, password, role } = formValues;

    if (!fullName.trim() || !email.trim() || !password || !role) {
      setError("All fields are required.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    const ok = await updateUser(user.id, email, role as UserRole, fullName, password);
    setIsLoading(false);

    if (!ok) {
      setError("Unable to update this user. The email may already exist.");
    } else {
      setSuccess("User profile updated successfully.");
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="relative bg-white w-full max-w-md rounded-2xl border border-slate-200/80 p-6 shadow-2xl animate-fade-in text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit User Profile
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-lg flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {success}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600">Full Name</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={formValues.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
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
              value={formValues.email}
              onChange={(e) => handleChange("email", e.target.value)}
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
              value={formValues.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              required
            />
          </div>

          {/* Role Dropdown */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600">Role</label>
            <select
              value={formValues.role}
              onChange={(e) => handleChange("role", e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none bg-white transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              required
            >
              <option value="" disabled>Select role...</option>
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
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-center text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-[0.98] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-xl bg-linear-to-br from-blue-600 to-indigo-650 py-2.5 text-center text-xs font-bold text-white shadow-md shadow-blue-500/15 transition-all active:scale-[0.98] cursor-pointer"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
