"use client";

import React, { useState, useMemo, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { DocumentItem, getDocuments, addDocument } from "../../utils/documentStore";
import { getCurrentUser, getRoleDetails } from "../../utils/userStore";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL params sync
  const categoryParam = searchParams.get("category");
  const searchParam = searchParams.get("search") || "";
  
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortField, setSortField] = useState<"nama" | "added">("nama");
  const [sortAsc, setSortAsc] = useState(true);

  const [currentUser, setCurrentUser] = useState({
    email: "putri.fatima@pertamina.com",
    role: "Admin" as any,
    fullName: "PUTRI FATIMA SUNNIA",
  });

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    const handleSessionChange = () => {
      setCurrentUser(getCurrentUser());
    };
    window.addEventListener("user-session-changed", handleSessionChange);
    return () => {
      window.removeEventListener("user-session-changed", handleSessionChange);
    };
  }, []);

  const roleDetails = getRoleDetails(currentUser.role);
  const userInitials = currentUser.fullName
    ? currentUser.fullName
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "US";

  // Sync with searchParams on mount/update
  useEffect(() => {
    getDocuments().then(setDocuments);
  }, []);

  useEffect(() => {
    if (categoryParam) {
      if (categoryParam === "HSE Plan") {
        router.push("/hse-plan");
      } else if (categoryParam === "PJA") {
        router.push("/pje");
      } else if (categoryParam === "WIP") {
        router.push("/wip");
      } else if (categoryParam === "FE") {
        router.push("/fe");
      } else {
        setSelectedCategory(categoryParam);
      }
    } else {
      setSelectedCategory("All");
    }
  }, [categoryParam, router]);

  useEffect(() => {
    setSearchQuery(searchParam);
  }, [searchParam]);



  // Toggle sorting logic
  const handleSort = (field: "nama" | "added") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Filter and sort table content
  const filteredAndSortedDocuments = useMemo(() => {
    return documents
      .filter((doc) => {
        const matchesSearch = doc.nama.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || doc.type === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        let valA: any = sortField === "nama" ? a.nama : new Date(a.addedDate).getTime();
        let valB: any = sortField === "nama" ? b.nama : new Date(b.addedDate).getTime();

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [documents, searchQuery, selectedCategory, sortField, sortAsc]);

  // Statistics calculation for KPI
  const stats = useMemo(() => {
    const totalNew = documents.filter((d) => d.status === "New").length;
    const totalProgress = documents.filter((d) => d.status === "On Progress").length;
    const totalDone = documents.filter((d) => d.status === "Done").length;
    const total = documents.length;

    return {
      newCount: totalNew,
      progressCount: totalProgress,
      doneCount: totalDone,
      total,
      hsePlan: documents.filter((d) => d.type === "HSE Plan").length,
      pja: documents.filter((d) => d.type === "PJA").length,
      wip: documents.filter((d) => d.type === "WIP").length,
      fe: documents.filter((d) => d.type === "FE").length,
    };
  }, [documents]);



  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* 1. LEFT SIDEBAR */}
      <Sidebar currentPath="/dashboard" selectedCategory={selectedCategory} documents={documents} />

      {/* 2. MAIN CONTENT PANEL */}
      <div className="flex flex-1 flex-col pl-72">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-200/60 bg-white/85 px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Dashboard Overview
            </h1>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-medium text-slate-500">
              {selectedCategory === "All" ? "All Documents" : selectedCategory}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-800">{currentUser.fullName}</p>
              <p className="text-[10px] font-medium text-slate-450">{roleDetails.position}</p>
            </div>
            <div className="h-10 w-10 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm shadow-inner">
              {userInitials}
            </div>
          </div>
        </header>

        {/* Dynamic View rendering */}
        <main className="flex-1 p-8 space-y-8 max-w-7xl w-full mx-auto animate-fade-in">
          
          {/* Main header banner card */}
          <div className="relative overflow-hidden rounded-2xl bg-slate-900 h-52 shadow-sm border border-slate-200/50">
            <Image
              src="/banner.png"
              alt="HSE Corporate Standards Banner"
              fill
              className="object-cover opacity-90"
              priority
            />
            <div className="absolute inset-0 bg-slate-900/10"></div>
          </div>

          {/* Breadcrumb indicator */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold text-slate-400/85 px-2 py-1 select-none">
            <Link href="/hse-plan" className="hover:text-red-500 transition-colors">HSE Plan</Link>
            <span className="text-slate-355 mx-1">-</span>
            <Link href="/pje" className="hover:text-blue-500 transition-colors">Pre Job Assesment</Link>
            <span className="text-slate-355 mx-1">-</span>
            <Link href="/wip" className="hover:text-slate-700 transition-colors">Work In Progress</Link>
            <span className="text-slate-355 mx-1">-</span>
            <Link href="/fe" className="hover:text-green-500 transition-colors">Final Evaluation</Link>
          </div>

          {/* KPI Dashboard Section Grid */}
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { id: "HSE Plan", name: "HSE Plan", value: `${stats.hsePlan}/80`, pct: 56.2, color: "from-red-500 to-rose-600", light: "bg-red-50 text-red-650 border-red-100", customRoute: "/hse-plan" },
              { id: "PJA", name: "PJA", value: `${stats.pja}/80`, pct: 35.0, color: "from-blue-500 to-indigo-600", light: "bg-blue-50 text-blue-600 border-blue-100", customRoute: "/pje" },
              { id: "WIP", name: "WIP", value: `${stats.wip}/80`, pct: 23.7, color: "from-amber-500 to-yellow-600", light: "bg-amber-50 text-amber-600 border-amber-100", customRoute: "/wip" },
              { id: "FE", name: "FE", value: `${stats.fe}/80`, pct: 10.0, color: "from-green-500 to-emerald-600", light: "bg-green-50 text-green-600 border-green-100", customRoute: "/fe" },
            ].map((kpi) => (
              <button
                key={kpi.id}
                onClick={() => {
                  if (kpi.customRoute) {
                    router.push(kpi.customRoute);
                  } else {
                    setSelectedCategory(kpi.id);
                  }
                }}
                    className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md hover:border-slate-300 text-left cursor-pointer"
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold border ${kpi.light}`}>
                        {kpi.name}
                      </span>
                      <div className="relative flex items-center justify-center">
                        <svg className="h-8 w-8 -rotate-90">
                          <circle cx="16" cy="16" r="12" className="stroke-slate-100 fill-none" strokeWidth="3" />
                          <circle
                            cx="16"
                            cy="16"
                            r="12"
                            className="stroke-blue-600 fill-none transition-all duration-500"
                            strokeWidth="3"
                            strokeDasharray={75}
                            strokeDashoffset={75 - (75 * kpi.pct) / 100}
                          />
                        </svg>
                        <span className="absolute text-[8px] font-bold text-slate-500">{Math.round(kpi.pct)}%</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-2xl font-extrabold tracking-tight text-slate-905">
                        {kpi.value}
                      </p>
                      <p className="text-xs font-medium text-slate-400 mt-1">
                        Procurements uploaded
                      </p>
                    </div>
                    <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${kpi.color}`} style={{ width: `${kpi.pct}%` }} />
                    </div>
                  </button>
                ))}
              </section>

              {/* Analytics Widgets Panel */}
              <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-905">Task Status Summary</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Procurement completion metrics</p>
                  </div>
                  <div className="relative my-6 flex items-center justify-center">
                    <svg className="h-44 w-44 -rotate-90" viewBox="0 0 42 42">
                      <circle cx="21" cy="21" r="15.915" className="stroke-slate-100 fill-none" strokeWidth="4.5" />
                      <circle cx="21" cy="21" r="15.915" className="stroke-emerald-500 fill-none" strokeWidth="4.5" strokeDasharray="55.5 44.5" strokeDashoffset="0" />
                      <circle cx="21" cy="21" r="15.915" className="stroke-blue-500 fill-none" strokeWidth="4.5" strokeDasharray="22.2 77.8" strokeDashoffset="-55.5" />
                      <circle cx="21" cy="21" r="15.915" className="stroke-red-500 fill-none" strokeWidth="4.5" strokeDasharray="22.3 77.7" strokeDashoffset="-77.7" />
                    </svg>
                    <div className="absolute text-center">
                      <p className="text-3xl font-extrabold text-slate-905">{stats.total}</p>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Docs</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center font-bold">
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Done ({stats.doneCount})
                      </span>
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-xs text-blue-600">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        Active ({stats.progressCount})
                      </span>
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-xs text-red-600">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        New ({stats.newCount})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-905">Phase Completion Progression</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Distribution weight percentages</p>
                  </div>
                  <div className="space-y-4 my-auto py-2">
                    {[
                      { name: "HSE Plan", pct: "40.87%", color: "bg-red-500", raw: "40.87%" },
                      { name: "PJA", pct: "26.89%", color: "bg-blue-500", raw: "26.89%" },
                      { name: "WIP", pct: "20.11%", color: "bg-amber-500", raw: "20.11%" },
                      { name: "FE", pct: "12.13%", color: "bg-green-500", raw: "12.13%" },
                    ].map((phase) => (
                      <div key={phase.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>{phase.name}</span>
                          <span>{phase.pct}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${phase.color}`} style={{ width: phase.raw }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-slate-400 bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-center mt-2">
                    * Percentages reflect weight of document checklists finalized.
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-905">Safety Alerts & Deadlines</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Action items requiring attention</p>
                  </div>
                  <div className="space-y-3.5 my-4">
                    <div className="rounded-xl border border-red-100 bg-red-50/50 p-3">
                      <div className="flex items-start gap-2.5">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-650">!</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-red-800">2 Pending HSE Submissions</p>
                          <p className="text-[10px] text-red-600/80 mt-0.5 truncate">SC Commander LVII and Gas Laura reviews overdue</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                      <div className="flex items-start gap-2.5">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">i</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-blue-800">3 Open Action Items (Temuan)</p>
                          <p className="text-[10px] text-blue-600/80 mt-0.5 truncate">PJA checks for LPGC Jenggala required before approval</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => alert("Loading full HSE audit history...")}
                    className="w-full rounded-xl border border-slate-200 py-2.5 text-center text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 active:scale-[0.99] cursor-pointer"
                  >
                    View Full Audit Logs
                  </button>
                </div>
              </section>

              {/* PROCUREMENT DATA TABLE */}
              <section className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm space-y-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-905">Procurement Audit Documents</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Search and inspect active HSE compliance folders</p>
                  </div>
                  
                  <div className="relative w-full sm:max-w-xs">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Search procurements..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
                  {["All", "HSE Plan", "PJA", "WIP", "FE"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        if (cat === "HSE Plan") {
                          router.push("/hse-plan");
                        } else if (cat === "PJA") {
                          router.push("/pje");
                        } else if (cat === "WIP") {
                          router.push("/wip");
                        } else if (cat === "FE") {
                          router.push("/fe");
                        } else {
                          setSelectedCategory(cat);
                        }
                      }}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                          : "bg-slate-50 border-slate-200/60 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
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
                          onClick={() => handleSort("added")}
                          className="px-5 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors group select-none w-36"
                        >
                          <div className="flex items-center gap-1">
                            Added
                            <span className="text-slate-400 group-hover:text-slate-600">
                              {sortField === "added" ? (sortAsc ? "↑" : "↓") : "↕"}
                            </span>
                          </div>
                        </th>
                        <th scope="col" className="px-5 py-3.5 w-32">Status</th>
                        <th scope="col" className="px-5 py-3.5 w-32">Document Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-700">
                      {filteredAndSortedDocuments.length > 0 ? (
                        filteredAndSortedDocuments.map((doc, idx) => (
                          <tr key={doc.no} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-5 py-4 text-slate-400">{idx + 1}</td>
                            <td className="px-5 py-4 font-semibold text-slate-900 leading-normal max-w-md">
                              {doc.nama}
                            </td>
                            <td className="px-5 py-4 text-slate-500">{doc.added}</td>
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold border ${
                                  doc.status === "New"
                                    ? "bg-red-50 border-red-100 text-red-750"
                                    : doc.status === "On Progress"
                                    ? "bg-blue-50 border-blue-100 text-blue-755"
                                    : "bg-emerald-50 border-emerald-100 text-emerald-700"
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
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-5 py-12 text-center text-slate-400 font-medium">
                            No documents matching &quot;{searchQuery}&quot; in category &quot;{selectedCategory}&quot;
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 font-semibold">
                  <p>Showing {filteredAndSortedDocuments.length} of {documents.length} procurements</p>
                  <div className="flex items-center gap-1.5 text-blue-650">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    Live Sync Enabled
                  </div>
                </div>
              </section>

        </main>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 font-sans">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-xs font-semibold">Loading Dashboard Page...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
