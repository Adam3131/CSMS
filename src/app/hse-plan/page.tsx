"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { DocumentItem, getDocuments } from "../../utils/documentStore";
import Sidebar from "../../components/Sidebar";

export default function HsePlanLandingPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"nama" | "added">("nama");
  const [sortAsc, setSortAsc] = useState(true);

  // Avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    setDocuments(getDocuments());
  }, []);

  // Filter for HSE Plan documents only
  const hseDocuments = useMemo(() => {
    return documents.filter((doc) => doc.type === "HSE Plan");
  }, [documents]);

  // Apply search query
  const filteredDocuments = useMemo(() => {
    return hseDocuments.filter((doc) =>
      doc.nama.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [hseDocuments, searchQuery]);

  // Apply sorting
  const sortedDocuments = useMemo(() => {
    return [...filteredDocuments].sort((a, b) => {
      let valA: any = sortField === "nama" ? a.nama : new Date(a.addedDate).getTime();
      let valB: any = sortField === "nama" ? b.nama : new Date(b.addedDate).getTime();

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredDocuments, sortField, sortAsc]);

  const handleSort = (field: "nama" | "added") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  if (!isMounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 font-sans">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-xs font-semibold">Loading HSSE Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* 1. LEFT SIDEBAR */}
      <Sidebar currentPath="/hse-plan" selectedCategory="HSE Plan" documents={documents} />

      {/* 2. MAIN CONTENT PANEL */}
      <div className="flex flex-1 flex-col pl-72">
        {/* Sticky Header */}
        <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-200/60 bg-white/80 px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-tight text-slate-800">
              HSE Plan
            </h1>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold text-slate-500">
              Overview
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-800">PUTRI FATIMA SUNNIA</p>
              <p className="text-[10px] font-medium text-slate-400">Environmental & HSSE Governance</p>
            </div>
            <div className="h-9 w-9 rounded-full border border-slate-200 bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-xs shadow-inner">
              PS
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Top Banner Image Card */}
          <div className="relative overflow-hidden rounded-2xl bg-slate-900 h-44 shadow-sm border border-slate-200/50">
            <Image
              src="/banner.png"
              alt="HSE Corporate Standards Banner"
              fill
              className="object-cover opacity-90 object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent" />
          </div>

          {/* Breadcrumb Navigation + Search Panel */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-200/60 rounded-xl p-3 border border-slate-300/40 select-none">
            <div className="flex flex-wrap items-center gap-x-2 text-[11px] font-bold text-slate-500/90 pl-2">
              <span className="text-slate-700 font-extrabold cursor-default">HSE Plan</span>
              <span className="text-slate-400">─</span>
              <Link href="/dashboard?category=PJA" className="hover:text-blue-600 transition-colors">Pre Job Assesment</Link>
              <span className="text-slate-400">─</span>
              <Link href="/dashboard?category=WIP" className="hover:text-amber-600 transition-colors">Work In Progress</Link>
              <span className="text-slate-400">─</span>
              <Link href="/dashboard?category=FE" className="hover:text-green-600 transition-colors">Final Evaluation</Link>
            </div>
            
            <div className="relative w-full md:max-w-xs">
              <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-lg border border-slate-200 bg-white pl-4 pr-10 py-1.5 text-xs text-slate-900 placeholder-slate-400 outline-none shadow-sm transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10"
              />
            </div>
          </div>

          {/* KPI Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* KPI Card 1: New HSE Plan */}
            <div className="rounded-xl border border-slate-200/80 bg-blue-50/40 p-5 shadow-sm flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shadow-inner">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">New HSE Plan</p>
                <p className="text-xl font-extrabold text-slate-800 mt-1">3/80</p>
              </div>
            </div>

            {/* KPI Card 2: Waiting for Approval */}
            <div className="rounded-xl border border-slate-200/80 bg-blue-50/40 p-5 shadow-sm flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shadow-inner">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Waiting for Approval</p>
                <p className="text-xl font-extrabold text-slate-800 mt-1">5/80</p>
              </div>
            </div>

            {/* KPI Card 3: HSE Plan Complete */}
            <div className="rounded-xl border border-slate-200/80 bg-blue-50/40 p-5 shadow-sm flex flex-col justify-center">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>HSE Plan Complete</span>
                <span className="text-slate-800 font-extrabold">88%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-200/80 rounded-full overflow-hidden mt-3 shadow-inner">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: "88%" }} />
              </div>
            </div>
          </div>

          {/* Analytics Pie Chart and Completion Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Left: Interactive Donut / Pie Chart representation */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex items-center justify-center gap-8 min-h-[160px]">
              <div 
                className="relative h-28 w-28 rounded-full border border-slate-200 shadow-inner flex items-center justify-center"
                style={{
                  background: "conic-gradient(#3b82f6 0% 40.87%, #ef4444 40.87% 67.76%, #f59e0b 67.76% 87.87%, #f1f5f9 87.87% 100%)"
                }}
              >
                {/* Inner cutout for donut style */}
                <div className="h-16 w-16 rounded-full bg-white flex flex-col items-center justify-center shadow-md">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ratio</span>
                  <span className="text-xs font-black text-slate-800">88%</span>
                </div>
              </div>
              <div className="space-y-2.5 text-xs font-bold text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-blue-500" />
                  <span>Done (40.87%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-red-500" />
                  <span>On Progress (26.89%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-amber-500" />
                  <span>New (20.11%)</span>
                </div>
              </div>
            </div>

            {/* Right: Progression Metrics Detail */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-center space-y-4">
              {[
                { label: "Done", val: "40,87%", color: "bg-blue-600", width: "40.87%" },
                { label: "On Progress", val: "26,89%", color: "bg-red-500", width: "26.89%" },
                { label: "New", val: "20,11%", color: "bg-amber-500", width: "20.11%" },
              ].map((item) => (
                <div key={item.label} className="space-y-1 text-xs font-semibold text-slate-700">
                  <div className="flex justify-between items-center">
                    <span>{item.label}</span>
                    <span className="font-bold text-slate-900">{item.val}</span>
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200/40">
                    <div className={`h-full ${item.color}`} style={{ width: item.width }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Row - Create Document Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              HSE Plan Documents
            </h2>
            <Link
              href="/hse-plan/create"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create HSE Plan
            </Link>
          </div>

          {/* HSE Document Table */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs font-medium">
                <thead className="bg-slate-50 font-bold text-slate-500">
                  <tr>
                    <th scope="col" className="px-5 py-3.5 w-16">No</th>
                    <th
                      scope="col"
                      onClick={() => handleSort("nama")}
                      className="px-5 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                    >
                      <div className="flex items-center gap-1">
                        Procurement Name
                        <span className="text-slate-400 group-hover:text-slate-600">
                          {sortField === "nama" ? (sortAsc ? "↑" : "↓") : "↕"}
                        </span>
                      </div>
                    </th>
                    <th
                      scope="col"
                      onClick={() => handleSort("added")}
                      className="px-5 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors group select-none w-36"
                    >
                      <div className="flex items-center gap-1">
                        Date
                        <span className="text-slate-400 group-hover:text-slate-600">
                          {sortField === "added" ? (sortAsc ? "↑" : "↓") : "↕"}
                        </span>
                      </div>
                    </th>
                    <th scope="col" className="px-5 py-3.5 w-32">Status</th>
                    <th scope="col" className="px-5 py-3.5 w-32">Document</th>
                    <th scope="col" className="px-5 py-3.5 w-52">Review Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                  {sortedDocuments.length > 0 ? (
                    sortedDocuments.map((doc, idx) => (
                      <tr key={doc.no} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-5 py-4 text-slate-400">{idx + 1}</td>
                        <td className="px-5 py-4 font-semibold text-slate-900 leading-relaxed max-w-md">
                          {doc.nama}
                        </td>
                        <td className="px-5 py-4 text-slate-500 font-semibold">{doc.added}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${
                              doc.status === "New"
                                ? "bg-red-50 border-red-100 text-red-600"
                                : doc.status === "On Progress"
                                ? "bg-amber-50 border-amber-100 text-amber-600"
                                : "bg-emerald-50 border-emerald-100 text-emerald-600"
                            }`}
                          >
                            {doc.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-bold text-slate-500">
                            {doc.type}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="space-y-1 text-[10px] text-slate-500 font-semibold leading-none">
                            <div className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                              <span>Pending review by HSSE</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                              <span>Pending review by User</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-400 font-bold">
                        No HSE Plan documents matching &quot;{searchQuery}&quot;
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Export & Footer Row */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-400 font-semibold">
                Showing {sortedDocuments.length} of {hseDocuments.length} HSE Plans
              </span>
              <button
                onClick={() => alert("Simulating document export...")}
                className="rounded-lg bg-slate-200 text-slate-700 px-6 py-1.5 text-xs font-bold transition-all hover:bg-slate-300 hover:text-slate-800 active:scale-[0.98]"
              >
                Export
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
