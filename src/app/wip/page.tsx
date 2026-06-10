"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DocumentItem, getDocuments } from "../../utils/documentStore";
import Sidebar from "../../components/Sidebar";
import { isSupabaseConfigured } from "../../utils/supabaseClient";

const MOCK_WIP_PROCUREMENTS = [
  {
    pengadaan: "Pengadaan Time Charter 1 (one) Unit VLGC Laycan 19-20 Februari 2024 (LPGC SC Commander LVII)",
    pelaksanaan: "23-Aug-2025",
    penilaianKe: "1",
    nilaiHsse: "Click to access form",
    nilaiShipShore: "100.0",
    feedback: "High compliance on all safety drills and deck inspections."
  },
  {
    pengadaan: "Pengadaan Time Charter 1 (satu) Unit Small 2 LPGC Pressurized Laycan 20-21 Februari 2024 (LPGC Gas Laura)",
    pelaksanaan: "06-Aug-2025",
    penilaianKe: "2",
    nilaiHsse: "Click to access form",
    nilaiShipShore: "98.0",
    feedback: "Minor observation on safety signs, resolved immediately."
  },
  {
    pengadaan: "LPGC Jenggala",
    pelaksanaan: "11-Apr-2026",
    penilaianKe: "1",
    nilaiHsse: "Click to access form",
    nilaiShipShore: "80.0",
    feedback: "Safety briefing logs updated."
  }
];

// Initial default items matching the screenshot exactly
const DEFAULT_WIP_ROWS = [
  {
    no: 1,
    nama: "Pengadaan Time Charter 1 (one) Unit VLGC Laycan 19-20 Februari 2024 (LPGC SC Commander LVII)",
    pelaksanaan: "23-Aug-2025",
    nilai: "100.0",
    type: "WIP"
  },
  {
    no: 2,
    nama: "Pengadaan Time Charter 1 (satu) Unit Small 2 LPGC Pressurized Laycan 20-21 Februari 2024 (LPGC Gas Laura)",
    pelaksanaan: "06-Aug-2025",
    nilai: "98.0",
    type: "WIP"
  },
  {
    no: 3,
    nama: "LPGC Jenggala",
    pelaksanaan: "11-Apr-2026",
    nilai: "80.0",
    type: "WIP"
  },
  {
    no: 4,
    nama: "Time Charter 1 (satu) Unit Small 2 LPGC Pressurized Laycan 10-11 Maret 2024 (LPGC Gas Artemis)",
    pelaksanaan: "10-Mar-2023",
    nilai: "100.0",
    type: "WIP"
  },
  {
    no: 5,
    nama: "Pengadaan Time Charter 1 (satu) unit small LPGC Pressurized Laycan 25-26 April 2024 (LPGC Gas Indonesia II)",
    pelaksanaan: "1-Jan-2022",
    nilai: "91.0",
    type: "WIP"
  },
  {
    no: 6,
    nama: "Pengadaan Time Charter 1 (satu) unit small LPGC Pressurized Laycan 23-24 Mei 2024 (LPGC Gas Kalimantan)",
    pelaksanaan: "22-Des-2021",
    nilai: "98.0",
    type: "WIP"
  }
];

export default function WipLandingPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"nama" | "pelaksanaan">("nama");
  const [sortAsc, setSortAsc] = useState(true);
  
  // Interactive card mock data state
  const [mockIndex, setMockIndex] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    getDocuments().then(setDocuments);
  }, []);

  // Filter and build the WIP documents list matching the screenshot + any new WIP documents added from wizard
  const wipDocumentsList = useMemo(() => {
    // Get new documents created dynamically of type "WIP" from localStore
    const dynamicWipDocs = documents.filter((doc) => doc.type === "WIP");
    
    if (isSupabaseConfigured) {
      return dynamicWipDocs.map((doc) => ({
        no: doc.no,
        nama: doc.nama,
        pelaksanaan: doc.added,
        nilai: doc.nilai || "95.0",
        type: "WIP"
      }));
    }
    
    // Standard default rows from mockup
    const rows = [...DEFAULT_WIP_ROWS];
    
    // Append dynamically added documents that are not already in default rows
    dynamicWipDocs.forEach((doc) => {
      const exists = rows.some((row) => row.nama.toLowerCase() === doc.nama.toLowerCase());
      if (!exists) {
        rows.push({
          no: rows.length + 1,
          nama: doc.nama,
          pelaksanaan: doc.added,
          nilai: doc.nilai || "95.0",
          type: "WIP"
        });
      }
    });
    
    return rows;
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    return wipDocumentsList.filter((doc) =>
      doc.nama.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [wipDocumentsList, searchQuery]);

  const sortedDocuments = useMemo(() => {
    return [...filteredDocuments].sort((a, b) => {
      let valA: any = sortField === "nama" ? a.nama : a.pelaksanaan;
      let valB: any = sortField === "nama" ? b.nama : b.pelaksanaan;

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredDocuments, sortField, sortAsc]);

  const handleSort = (field: "nama" | "pelaksanaan") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleLoadNewData = () => {
    setMockIndex((prev) => (prev + 1) % MOCK_WIP_PROCUREMENTS.length);
  };

  const handleAddClick = () => {
    const current = MOCK_WIP_PROCUREMENTS[mockIndex];
    const params = new URLSearchParams({
      projectName: current.pengadaan,
      pelaksanaan: current.pelaksanaan,
      penilaianKe: current.penilaianKe,
      nilaiHsse: current.nilaiHsse,
      nilaiShipShore: current.nilaiShipShore
    });
    router.push(`/wip/create?${params.toString()}`);
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

  const currentProc = MOCK_WIP_PROCUREMENTS[mockIndex];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* 1. LEFT SIDEBAR */}
      <Sidebar currentPath="/wip" selectedCategory="WIP" documents={documents} />

      {/* 2. MAIN CONTENT PANEL */}
      <div className="flex flex-1 flex-col pl-72">
        {/* Sticky Header */}
        <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-200/60 bg-white/80 px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-tight text-slate-800">
              Work In Progress (WIP)
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
            {/* Overlay sub-nav breadcrumbs */}
            <div className="absolute inset-x-0 bottom-0 bg-slate-950/45 backdrop-blur-md border-t border-white/10 px-6 py-3 flex items-center justify-between text-white select-none">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wide">
                <Link href="/hse-plan" className="opacity-60 hover:opacity-100 transition-opacity">PQ</Link>
                <span className="opacity-40">──</span>
                <Link href="/pje" className="opacity-60 hover:opacity-100 transition-opacity">PJA</Link>
                <span className="opacity-40">──</span>
                <span className="border border-blue-500 bg-blue-500/25 px-3 py-1 rounded-lg text-blue-300 font-extrabold shadow-sm shadow-blue-500/20">
                  WIP
                </span>
                <span className="opacity-40">──</span>
                <span className="opacity-60 cursor-default">FE</span>
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-300">
                Work In Progress Phase
              </div>
            </div>
          </div>

          {/* Interactive Card */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Search, Document Preview, Load Button */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="relative">
                  <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-white pl-4 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none shadow-sm transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 font-medium"
                  />
                </div>

                {/* CSS Styled Document Preview Image */}
                <div className="border border-slate-200 bg-slate-50/50 rounded-xl p-4 aspect-[4/3] flex flex-col justify-between shadow-inner relative overflow-hidden select-none">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="font-extrabold text-[8px] text-indigo-650 tracking-wider">WORK IN PROGRESS</span>
                      <span className="text-[6px] text-slate-400 font-bold">FORM-WIP-03</span>
                    </div>
                    <div className="h-2 w-3/4 bg-slate-200 rounded-sm" />
                    <div className="h-2 w-1/2 bg-slate-200 rounded-sm" />
                    <div className="h-2 w-5/6 bg-slate-200 rounded-sm" />
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <div className="h-1.5 w-8 bg-slate-100 rounded-sm" />
                      <div className="h-1.5 w-12 bg-slate-100 rounded-sm" />
                    </div>
                    <span className="text-2xl font-black text-slate-200/90 tracking-tight">WIP</span>
                  </div>
                </div>

                <button
                  onClick={handleLoadNewData}
                  className="w-full rounded-xl border border-slate-200 py-2.5 text-center text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 active:scale-[0.99] shadow-sm cursor-pointer"
                >
                  Load new data
                </button>
              </div>

              {/* Right Column: Read-Only / Interactive Fields */}
              <div className="lg:col-span-8 flex flex-col justify-between">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Pengadaan</label>
                    <textarea
                      readOnly
                      rows={2}
                      value={currentProc.pengadaan}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-600 outline-none resize-none cursor-default leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pelaksanaan</label>
                    <input
                      type="text"
                      readOnly
                      value={currentProc.pelaksanaan}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-600 outline-none cursor-default"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Penilaian ke-</label>
                    <select
                      value={currentProc.penilaianKe}
                      disabled
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-600 outline-none cursor-default appearance-none"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nilai HSSE Practice</label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={currentProc.nilaiHsse}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-3 pr-10 py-2 text-xs font-bold text-blue-650 outline-none cursor-default"
                      />
                      <span className="absolute inset-y-0 right-3 flex items-center text-[9px] text-blue-500 font-extrabold uppercase">Form</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nilai Ship Shore Safety Checklist</label>
                    <input
                      type="text"
                      readOnly
                      value={currentProc.nilaiShipShore}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-600 outline-none cursor-default"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Feedback</label>
                    <textarea
                      readOnly
                      rows={2}
                      value={currentProc.feedback}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-500 outline-none resize-none cursor-default leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleAddClick}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-750 px-8 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* WIP Compliance Documents Table */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center select-none">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-655 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.95] cursor-pointer"
                  title="Back to Dashboard"
                >
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  WIP Compliance Documents
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-bold">
                Showing {sortedDocuments.length} of {wipDocumentsList.length} WIP Documents
              </span>
            </div>

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
                        Nama Pengadaan
                        <span className="text-slate-400 group-hover:text-slate-600">
                          {sortField === "nama" ? (sortAsc ? "↑" : "↓") : "↕"}
                        </span>
                      </div>
                    </th>
                    <th
                      scope="col"
                      onClick={() => handleSort("pelaksanaan")}
                      className="px-5 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors group select-none w-44"
                    >
                      <div className="flex items-center gap-1">
                        Pelaksanaan
                        <span className="text-slate-400 group-hover:text-slate-600">
                          {sortField === "pelaksanaan" ? (sortAsc ? "↑" : "↓") : "↕"}
                        </span>
                      </div>
                    </th>
                    <th scope="col" className="px-5 py-3.5 w-32">Nilai</th>
                    <th scope="col" className="px-5 py-3.5 w-28 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-705">
                  {sortedDocuments.length > 0 ? (
                    sortedDocuments.map((doc, idx) => (
                      <tr key={doc.no} className="hover:bg-slate-55/40 transition-all">
                        <td className="px-5 py-4 text-slate-400">{idx + 1}</td>
                        <td className="px-5 py-4 font-semibold text-slate-900 leading-relaxed max-w-md">
                          {doc.nama}
                        </td>
                        <td className="px-5 py-4 text-slate-500 font-semibold">{doc.pelaksanaan}</td>
                        <td className="px-5 py-4 text-blue-700 font-bold">
                          {doc.nilai}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => alert(`Reviewing actions for: ${doc.nama}`)}
                              className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                              title="Email Audit Report"
                            >
                              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => alert(`Editing document: ${doc.nama}`)}
                              className="text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                              title="Edit Compliance Form"
                            >
                              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-400 font-bold">
                        No WIP documents matching &quot;{searchQuery}&quot;
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
