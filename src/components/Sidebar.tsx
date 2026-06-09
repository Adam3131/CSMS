"use client";

import React from "react";
import Link from "next/link";
import { DocumentItem } from "../utils/documentStore";

interface SidebarProps {
  currentPath: string;
  selectedCategory?: string;
  documents: DocumentItem[];
}

export default function Sidebar({ currentPath, selectedCategory = "All", documents }: SidebarProps) {
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

  return (
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
            href="/"
            className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              currentPath === "/"
                ? "bg-white text-slate-800 shadow-sm"
                : "bg-white/40 text-slate-600 hover:bg-white/70 hover:text-slate-800"
            }`}
          >
            <svg className="h-4.5 w-4.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </Link>
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              currentPath === "/dashboard" && selectedCategory === "All"
                ? "bg-white text-slate-800 shadow-sm"
                : "bg-white/40 text-slate-600 hover:bg-white/70 hover:text-slate-800"
            }`}
          >
            <svg className="h-4.5 w-4.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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

        {/* Recent */}
        <div className="space-y-2">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Recent
          </p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
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

      {/* User profile footer info */}
      <div className="border-t border-slate-200/60 pt-4 mt-auto">
        <div className="flex items-center gap-3 px-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs">
            PS
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-slate-850">
              PUTRI FATIMA SUNNIA
            </p>
            <p className="truncate text-[10px] text-slate-400 font-semibold">
              putri.fatima@pertamina.com
            </p>
          </div>
        </div>
        <div className="mt-2 text-[9px] font-bold text-slate-400 px-1">
          Environmental & HSSE Governance
        </div>
      </div>
    </aside>
  );
}
