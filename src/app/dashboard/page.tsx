"use client";

import React, { useState, useMemo, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { DocumentItem, getDocuments, addDocument } from "../../utils/documentStore";

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

  // Sync with searchParams on mount/update
  useEffect(() => {
    setDocuments(getDocuments());
  }, []);

  useEffect(() => {
    if (categoryParam) {
      if (categoryParam === "HSE Plan") {
        router.push("/hse-plan");
      } else if (categoryParam === "PJA") {
        router.push("/pje");
      } else {
        setSelectedCategory(categoryParam);
        setCurrentView("create-document");
        setActiveDocumentType(categoryParam as any);
      }
    } else {
      setSelectedCategory("All");
      setCurrentView("overview");
    }
  }, [categoryParam, router]);

  useEffect(() => {
    setSearchQuery(searchParam);
  }, [searchParam]);

  // Core navigation state:
  // "overview" = main metrics and table
  // "create-document" = document workspace (subpath activeDocumentType)
  const [currentView, setCurrentView] = useState<"overview" | "create-document">("overview");
  const [activeDocumentType, setActiveDocumentType] = useState<"HSE Plan" | "PJA" | "WIP" | "FE">("PJA");

  // Form states - PJA / general info shared reference
  const [vendorName, setVendorName] = useState("PT Warna SeBahtera");
  const [projectName, setProjectName] = useState("Pengadaan Time Charter 1 (one) Unit VLGC Laycan 19-20 Februari 2024 (LPGC SC Commander LVII)");
  const [evaluationDate, setEvaluationDate] = useState("2024-02-22");
  const [evaluatorName, setEvaluatorName] = useState("PUTRI FATIMA SUNNIA");
  const [lokasiPekerjaan, setLokasiPekerjaan] = useState("");
  const [picJabatan, setPicJabatan] = useState("");

  // Form states - WIP
  const [wipStep, setWipStep] = useState<1 | 2 | 3>(1);
  const [wipAssessmentStage, setWipAssessmentStage] = useState("");
  const [wipNamaPerusahaan, setWipNamaPerusahaan] = useState("PT Warna SeBahtera");
  const [wipJenisPekerjaan, setWipJenisPekerjaan] = useState("Jasa Pelayaran & Pengangkutan Gas");
  const [wipLokasiPekerjaan, setWipLokasiPekerjaan] = useState("");
  const [wipTanggalPenilaian, setWipTanggalPenilaian] = useState("");
  const [wipEvaluator, setWipEvaluator] = useState("PUTRI FATIMA SUNNIA");
  const [wipStatus, setWipStatus] = useState("On Review by PIC");
  const [wipLastEdit, setWipLastEdit] = useState("22 February 2026");

  // Indicator States - WIP Step 2
  const [wipLagging, setWipLagging] = useState<Record<string, { target: string; actual: string; sanksi: string }>>({
    row1: { target: "", actual: "", sanksi: "" },
    row2: { target: "", actual: "", sanksi: "" },
    row3: { target: "", actual: "", sanksi: "" },
  });
  const [wipLeading, setWipLeading] = useState<Record<string, { target: string; actual: string; sanksi: string }>>({
    row1: { target: "", actual: "", sanksi: "" },
    row2: { target: "", actual: "", sanksi: "" },
    row3: { target: "", actual: "", sanksi: "" },
    row4: { target: "", actual: "", sanksi: "" },
    row5: { target: "", actual: "", sanksi: "" },
    row6: { target: "", actual: "", sanksi: "" },
    row7: { target: "", actual: "", sanksi: "" },
  });

  // Indicator States - WIP Step 3
  const [wipPjaIndicators, setWipPjaIndicators] = useState<Record<string, { target: string; actual: string; sanksi: string }>>({
    row1: { target: "", actual: "", sanksi: "" },
    row2: { target: "", actual: "", sanksi: "" },
    row3: { target: "", actual: "", sanksi: "" },
  });
  const [wipLeadingStep3, setWipLeadingStep3] = useState<Record<string, { target: string; actual: string; sanksi: string }>>({
    row1: { target: "", actual: "", sanksi: "" },
    row2: { target: "", actual: "", sanksi: "" },
    row3: { target: "", actual: "", sanksi: "" },
    row4: { target: "", actual: "", sanksi: "" },
    row5: { target: "", actual: "", sanksi: "" },
    row6: { target: "", actual: "", sanksi: "" },
    row7: { target: "", actual: "", sanksi: "" },
  });

  // Form states - FE
  const [totalTemuan, setTotalTemuan] = useState("");
  const [statusTemuan, setStatusTemuan] = useState("Closed");
  const [hseScore, setHseScore] = useState("");
  const [rekomendasiClose, setRekomendasiClose] = useState("");

  const formRef = useRef<HTMLFormElement>(null);

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

  // Handle document creation completion
  const handleDocumentSubmit = (type: "HSE Plan" | "PJA" | "WIP" | "FE") => {
    let isValid = true;
    if (formRef.current) {
      isValid = formRef.current.checkValidity();
      if (!isValid) {
        formRef.current.reportValidity();
        return;
      }
    }

    const dateFormatted = new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).replace(/ /g, "-");

    const updated = addDocument({
      nama: projectName,
      added: dateFormatted,
      addedDate: new Date().toISOString(),
      status: "Done",
      type: type,
    });

    alert(`${type} document created successfully!`);
    
    setDocuments(updated);
    setCurrentView("overview");
    setSelectedCategory("All");
    setWipStep(1);
    setWipAssessmentStage("");
    setWipNamaPerusahaan("PT Warna SeBahtera");
    setWipJenisPekerjaan("Jasa Pelayaran & Pengangkutan Gas");
    setWipLokasiPekerjaan("");
    setWipTanggalPenilaian("");
    setWipEvaluator("PUTRI FATIMA SUNNIA");
    setWipLagging({
      row1: { target: "", actual: "", sanksi: "" },
      row2: { target: "", actual: "", sanksi: "" },
      row3: { target: "", actual: "", sanksi: "" },
    });
    setWipLeading({
      row1: { target: "", actual: "", sanksi: "" },
      row2: { target: "", actual: "", sanksi: "" },
      row3: { target: "", actual: "", sanksi: "" },
      row4: { target: "", actual: "", sanksi: "" },
      row5: { target: "", actual: "", sanksi: "" },
      row6: { target: "", actual: "", sanksi: "" },
      row7: { target: "", actual: "", sanksi: "" },
    });
    setWipPjaIndicators({
      row1: { target: "", actual: "", sanksi: "" },
      row2: { target: "", actual: "", sanksi: "" },
      row3: { target: "", actual: "", sanksi: "" },
    });
    setWipLeadingStep3({
      row1: { target: "", actual: "", sanksi: "" },
      row2: { target: "", actual: "", sanksi: "" },
      row3: { target: "", actual: "", sanksi: "" },
      row4: { target: "", actual: "", sanksi: "" },
      row5: { target: "", actual: "", sanksi: "" },
      row6: { target: "", actual: "", sanksi: "" },
      row7: { target: "", actual: "", sanksi: "" },
    });
  };

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
              {currentView === "overview" ? "Dashboard Overview" : `${activeDocumentType} Configuration`}
            </h1>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-medium text-slate-500">
              {currentView === "overview"
                ? selectedCategory === "All"
                  ? "All Documents"
                  : selectedCategory
                : activeDocumentType === "WIP"
                ? `Step ${wipStep} of 3`
                : "Form Setup"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-955">PUTRI FATIMA SUNNIA</p>
              <p className="text-[10px] font-medium text-slate-400">HSSE Governance Officer</p>
            </div>
            <div className="h-10 w-10 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm shadow-inner">
              PS
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
            <span className={activeDocumentType === "PJA" && currentView === "create-document" ? "text-blue-500 font-bold" : ""}>Pre Job Assesment</span>
            <span className="text-slate-355 mx-1">-</span>
            <span className={activeDocumentType === "WIP" && currentView === "create-document" ? "text-slate-700 font-bold" : ""}>Work In Progress</span>
            <span className="text-slate-355 mx-1">-</span>
            <span className={activeDocumentType === "FE" && currentView === "create-document" ? "text-green-500 font-bold" : ""}>Final Evaluation</span>
          </div>

          {currentView === "overview" ? (
            /* ======================================================== */
            /* VIEW A: DASHBOARD OVERVIEW */
            /* ======================================================== */
            <>
              {/* KPI Dashboard Section Grid */}
              <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { id: "HSE Plan", name: "HSE Plan", value: `${stats.hsePlan}/80`, pct: 56.2, color: "from-red-500 to-rose-600", light: "bg-red-50 text-red-650 border-red-100", customRoute: "/hse-plan" },
                  { id: "PJA", name: "PJA", value: `${stats.pja}/80`, pct: 35.0, color: "from-blue-500 to-indigo-600", light: "bg-blue-50 text-blue-600 border-blue-100", customRoute: "/pje" },
                  { id: "WIP", name: "WIP", value: `${stats.wip}/80`, pct: 23.7, color: "from-amber-500 to-yellow-600", light: "bg-amber-50 text-amber-600 border-amber-100" },
                  { id: "FE", name: "FE", value: `${stats.fe}/80`, pct: 10.0, color: "from-green-500 to-emerald-600", light: "bg-green-50 text-green-600 border-green-100" },
                ].map((kpi) => (
                  <button
                    key={kpi.id}
                    onClick={() => {
                      if (kpi.customRoute) {
                        router.push(kpi.customRoute);
                      } else {
                        setSelectedCategory(kpi.id);
                        setActiveDocumentType(kpi.id as any);
                        setCurrentView("create-document");
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
                        } else {
                          setSelectedCategory(cat);
                          if (cat !== "All") {
                            setActiveDocumentType(cat as any);
                            setCurrentView("create-document");
                          }
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
            </>
          ) : (
            /* ======================================================== */
            /* VIEW B: CREATE DOCUMENT WORKSPACES (INDEPENDENT) */
            /* ======================================================== */
            <div className="space-y-6">
              {/* PJA Creation Wizard has been refactored to /pje/create */}

              {/* ============================================== */}
              {/* DOCUMENT PATH C: WIP WORKFLOW (3 STEPS) */}
              {/* ============================================== */}
              {activeDocumentType === "WIP" && (
                <div className="space-y-6">
                  <div className="rounded-2xl bg-[#E8EBF9]/65 p-6 border border-indigo-100/50 shadow-sm">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1 flex flex-col justify-between space-y-2">
                        <label className="block text-xs font-bold text-indigo-955/60 uppercase tracking-wider">Work In Progress</label>
                        <div className="flex-1 rounded-xl bg-white border border-indigo-50/50 p-4 text-sm font-semibold text-slate-800 shadow-sm leading-relaxed flex items-center min-h-[5.5rem]">
                          {projectName}
                        </div>
                      </div>
                      <div className="w-full lg:w-64 space-y-4">
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-indigo-955/60 uppercase tracking-wider">Status</label>
                          <input type="text" value={wipStatus} onChange={(e) => setWipStatus(e.target.value)} className="block w-full rounded-xl border border-indigo-100 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:ring-1 focus:ring-indigo-300" />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-indigo-955/60 uppercase tracking-wider">Last edit</label>
                          <input type="text" value={wipLastEdit} onChange={(e) => setWipLastEdit(e.target.value)} className="block w-full rounded-xl border border-indigo-100 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:ring-1 focus:ring-indigo-300" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {wipStep === 1 ? (
                    <div className="rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm">
                      <form onSubmit={(e) => { e.preventDefault(); setWipStep(2); }} className="space-y-6">
                        <div>
                          <h3 className="text-xl font-bold text-slate-905 pb-1">WIP Form</h3>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="wip-stage" className="block text-sm font-bold text-slate-800">WIP assessment stages</label>
                          <select id="wip-stage" required value={wipAssessmentStage} onChange={(e) => setWipAssessmentStage(e.target.value)} className="block w-full rounded-xl border border-transparent bg-slate-100/90 px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none focus:bg-slate-200/60 transition-all">
                            <option value="">..</option>
                            <option value="Stage 1 - Awal Pekerjaan">Stage 1 - Awal Pekerjaan</option>
                            <option value="Stage 2 - Pertengahan Pekerjaan">Stage 2 - Pertengahan Pekerjaan</option>
                            <option value="Stage 3 - Akhir Pekerjaan">Stage 3 - Akhir Pekerjaan</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="wip-company" className="block text-sm font-bold text-slate-800">Nama Perusahaan</label>
                          <input type="text" id="wip-company" required placeholder="PT Warna SeBahtera" value={wipNamaPerusahaan} onChange={(e) => setWipNamaPerusahaan(e.target.value)} className="block w-full rounded-xl border border-transparent bg-slate-100/90 px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none focus:bg-slate-200/60 transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="wip-job" className="block text-sm font-bold text-slate-800">Jenis Pekerjaan</label>
                          <input type="text" id="wip-job" required placeholder="Jasa Pelayaran & Pengangkutan Gas" value={wipJenisPekerjaan} onChange={(e) => setWipJenisPekerjaan(e.target.value)} className="block w-full rounded-xl border border-transparent bg-slate-100/90 px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none focus:bg-slate-200/60 transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="wip-location" className="block text-sm font-bold text-slate-800">Lokasi Pekerjaan</label>
                          <input type="text" id="wip-location" required placeholder="Masukkan lokasi pekerjaan..." value={wipLokasiPekerjaan} onChange={(e) => setWipLokasiPekerjaan(e.target.value)} className="block w-full rounded-xl border border-transparent bg-slate-100/90 px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none focus:bg-slate-200/60 transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="wip-date" className="block text-sm font-bold text-slate-800">Tanggal Penilaian</label>
                          <input type="date" id="wip-date" required value={wipTanggalPenilaian} onChange={(e) => setWipTanggalPenilaian(e.target.value)} className="block w-full rounded-xl border border-transparent bg-slate-100/90 px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none focus:bg-slate-200/60 transition-all" />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="wip-evaluator" className="block text-sm font-bold text-slate-800">Evaluator</label>
                          <input type="text" id="wip-evaluator" required placeholder="PUTRI FATIMA SUNNIA" value={wipEvaluator} onChange={(e) => setWipEvaluator(e.target.value)} className="block w-full rounded-xl border border-transparent bg-slate-100/90 px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none focus:bg-slate-200/60 transition-all" />
                        </div>
                        <div className="flex justify-end pt-4 gap-3">
                          <button type="button" onClick={() => { setCurrentView("overview"); setSelectedCategory("All"); }} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-650 hover:bg-slate-50">Cancel</button>
                          <button type="submit" className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-650 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98]">Continue</button>
                        </div>
                      </form>
                    </div>
                  ) : wipStep === 2 ? (
                    <div className="rounded-2xl border border-indigo-100 bg-[#E8EBF9]/65 p-8 shadow-sm space-y-6">
                      <div className="flex justify-start">
                        <span className="inline-flex rounded-full bg-white px-5 py-2 text-xs font-extrabold text-indigo-955 uppercase tracking-wide shadow-sm select-none">
                          PENCAPAIAN LAGGING INDICATOR
                        </span>
                      </div>
                      
                      <div className="overflow-x-auto rounded-lg border border-slate-350 shadow-sm bg-white">
                        <table className="min-w-full border-collapse text-left text-xs font-medium">
                          <thead className="bg-white text-slate-850 font-bold border-b border-slate-300">
                            <tr>
                              <th className="px-4 py-3 border-r border-slate-300 uppercase font-extrabold w-[50%]">LAGGING INDICATOR</th>
                              <th className="px-2 py-3 border-r border-slate-300 text-center uppercase font-extrabold w-[12%]">Target</th>
                              <th className="px-2 py-3 border-r border-slate-300 text-center uppercase font-extrabold w-[12%]">Aktual</th>
                              <th className="px-2 py-3 border-r border-slate-300 text-center uppercase font-extrabold w-[20%]">Sanksi Kerja</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-300">
                            {[
                              { key: "row1", text: "Fatality atau Oil Spill ≥ 15 Bbls atau Property Damage ≥ USD 1.000.000" },
                              { key: "row2", text: "Luka/ cedera/ sakit menyebabkan Hari kerja hilang (Day away from work) atau 5 ≤ oil spill < 15 Bbls atau USD 100.000 ≤ Property Damage < USD 1.000.000." },
                              { key: "row3", text: "Luka/ cedera/ sakit menyebabkan penanganan dan perawatan korban melebihi P3K (Medical Treatment Cases/ restricted work days/ transfer to another job) atau 1 ≤ oil spill < 5 Bbls atau USD 10.000 ≤ Property Damage < USD 100.000." }
                            ].map((row) => (
                              <tr key={row.key} className="border-b border-slate-300 hover:bg-slate-50/50">
                                <td className="px-4 py-3 border-r border-slate-300 font-bold text-slate-800 leading-relaxed max-w-md">{row.text}</td>
                                <td className="p-1 border-r border-slate-300">
                                  <input type="text" placeholder="Target..." value={wipLagging[row.key].target} onChange={(e) => setWipLagging(prev => ({ ...prev, [row.key]: { ...prev[row.key], target: e.target.value } }))} className="w-full h-full bg-transparent px-2 py-1.5 text-center text-xs font-semibold text-slate-800 outline-none" />
                                </td>
                                <td className="p-1 border-r border-slate-300">
                                  <input type="text" placeholder="Aktual..." value={wipLagging[row.key].actual} onChange={(e) => setWipLagging(prev => ({ ...prev, [row.key]: { ...prev[row.key], actual: e.target.value } }))} className="w-full h-full bg-transparent px-2 py-1.5 text-center text-xs font-semibold text-slate-800 outline-none" />
                                </td>
                                <td className="p-1 border-r border-slate-300">
                                  <input type="text" placeholder="Sanksi..." value={wipLagging[row.key].sanksi} onChange={(e) => setWipLagging(prev => ({ ...prev, [row.key]: { ...prev[row.key], sanksi: e.target.value } }))} className="w-full h-full bg-transparent px-2 py-1.5 text-center text-xs font-semibold text-slate-800 outline-none" />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* LEADING INDICATOR TABLE */}
                      <div className="overflow-x-auto rounded-lg border border-slate-350 shadow-sm bg-white mt-4">
                        <table className="min-w-full border-collapse text-left text-xs font-medium">
                          <thead className="bg-white text-slate-850 font-bold border-b border-slate-300">
                            <tr>
                              <th className="px-4 py-3 border-r border-slate-300 uppercase font-extrabold w-[50%]">LEADING INDICATOR</th>
                              <th className="px-2 py-3 border-r border-slate-300 text-center uppercase font-extrabold w-[12%]">Target</th>
                              <th className="px-2 py-3 border-r border-slate-300 text-center uppercase font-extrabold w-[12%]">Aktual</th>
                              <th className="px-2 py-3 border-r border-slate-300 text-center uppercase font-extrabold w-[20%]">Sanksi Kerja</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-300">
                            {[
                              { key: "row1", text: "Pelaksanaan HSSE Management Walk Through (MWT)/ Manajemen Visit" },
                              { key: "row2", text: "Pemberian reward dan sanksi HSSE" },
                              { key: "row3", text: "Penyampaian laporan kinerja HSSE Pelaksana Kontrak kepada pertamina" },
                              { key: "row4", text: "Pelaksanaan HSSE Meeting" },
                              { key: "row5", text: "Mengikutsertakan pekerja dalam BPJS Ketenagakerjaan" },
                              { key: "row6", text: "Pelaksanaan HSSE Talk/ Tool Box Meeting" },
                              { key: "row7", text: "Pelaksanaan HSSE Induction" }
                            ].map((row) => (
                              <tr key={row.key} className="border-b border-slate-300 hover:bg-slate-50/50">
                                <td className="px-4 py-3 border-r border-slate-300 font-bold text-slate-800 leading-relaxed max-w-md">{row.text}</td>
                                <td className="p-1 border-r border-slate-300">
                                  <input type="text" placeholder="Target..." value={wipLeading[row.key].target} onChange={(e) => setWipLeading(prev => ({ ...prev, [row.key]: { ...prev[row.key], target: e.target.value } }))} className="w-full h-full bg-transparent px-2 py-1.5 text-center text-xs font-semibold text-slate-800 outline-none" />
                                </td>
                                <td className="p-1 border-r border-slate-300">
                                  <input type="text" placeholder="Aktual..." value={wipLeading[row.key].actual} onChange={(e) => setWipLeading(prev => ({ ...prev, [row.key]: { ...prev[row.key], actual: e.target.value } }))} className="w-full h-full bg-transparent px-2 py-1.5 text-center text-xs font-semibold text-slate-800 outline-none" />
                                </td>
                                <td className="p-1 border-r border-slate-300">
                                  <input type="text" placeholder="Sanksi..." value={wipLeading[row.key].sanksi} onChange={(e) => setWipLeading(prev => ({ ...prev, [row.key]: { ...prev[row.key], sanksi: e.target.value } }))} className="w-full h-full bg-transparent px-2 py-1.5 text-center text-xs font-semibold text-slate-800 outline-none" />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex justify-between items-center pt-4">
                        <button type="button" onClick={() => setWipStep(1)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-655 hover:bg-slate-50 active:scale-[0.98]">Back</button>
                        <button type="button" onClick={() => setWipStep(3)} className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-650 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98]">Continue</button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-indigo-100 bg-[#E8EBF9]/65 p-8 shadow-sm space-y-6">
                      <div className="flex justify-start">
                        <span className="inline-flex rounded-full bg-white px-5 py-2 text-xs font-extrabold text-indigo-950 uppercase tracking-wide shadow-sm select-none">
                          II. PENILAIAN SEBELUM PEKERJAAN BERLANGSUNG (PJA)
                        </span>
                      </div>

                      <div className="overflow-x-auto rounded-lg border border-slate-355 shadow-sm bg-white">
                        <table className="min-w-full border-collapse text-left text-xs font-medium">
                          <thead className="bg-white text-slate-850 font-bold border-b border-slate-300">
                            <tr>
                              <th className="px-4 py-3 border-r border-slate-300 uppercase font-extrabold w-[50%]">PENCAPAIAN PENILAIAN PRE JOB ASESSMENT</th>
                              <th className="px-2 py-3 border-r border-slate-300 text-center uppercase font-extrabold w-[12%]">Target</th>
                              <th className="px-2 py-3 border-r border-slate-300 text-center uppercase font-extrabold w-[12%]">Aktual</th>
                              <th className="px-2 py-3 border-r border-slate-300 text-center uppercase font-extrabold w-[20%]">Sanksi Kerja</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-300">
                            {[
                              { key: "row1", text: "Fatality atau Oil Spill ≥ 15 Bbls atau Property Damage ≥ USD 1.000.000" },
                              { key: "row2", text: "Luka/ cedera/ sakit menyebabkan Hari kerja hilang (Day away from work) atau 5 ≤ oil spill < 15 Bbls atau USD 100.000 ≤ Property Damage < USD 1.000.000." },
                              { key: "row3", text: "Luka/ cedera/ sakit menyebabkan penanganan dan perawatan korban melebihi P3K (Medical Treatment Cases/ restricted work days/ transfer to another job) atau 1 ≤ oil spill < 5 Bbls atau USD 10.000 ≤ Property Damage < USD 100.000." }
                            ].map((row) => (
                              <tr key={row.key} className="border-b border-slate-300 hover:bg-slate-50/50">
                                <td className="px-4 py-3 border-r border-slate-300 font-bold text-slate-800 leading-relaxed max-w-md">{row.text}</td>
                                <td className="p-1 border-r border-slate-300">
                                  <input type="text" placeholder="Target..." value={wipPjaIndicators[row.key].target} onChange={(e) => setWipPjaIndicators(prev => ({ ...prev, [row.key]: { ...prev[row.key], target: e.target.value } }))} className="w-full h-full bg-transparent px-2 py-1.5 text-center text-xs font-semibold text-slate-800 outline-none" />
                                </td>
                                <td className="p-1 border-r border-slate-300">
                                  <input type="text" placeholder="Aktual..." value={wipPjaIndicators[row.key].actual} onChange={(e) => setWipPjaIndicators(prev => ({ ...prev, [row.key]: { ...prev[row.key], actual: e.target.value } }))} className="w-full h-full bg-transparent px-2 py-1.5 text-center text-xs font-semibold text-slate-800 outline-none" />
                                </td>
                                <td className="p-1 border-r border-slate-300">
                                  <input type="text" placeholder="Sanksi..." value={wipPjaIndicators[row.key].sanksi} onChange={(e) => setWipPjaIndicators(prev => ({ ...prev, [row.key]: { ...prev[row.key], sanksi: e.target.value } }))} className="w-full h-full bg-transparent px-2 py-1.5 text-center text-xs font-semibold text-slate-800 outline-none" />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* LEADING INDICATOR TABLE */}
                      <div className="overflow-x-auto rounded-lg border border-slate-355 shadow-sm bg-white mt-4">
                        <table className="min-w-full border-collapse text-left text-xs font-medium">
                          <thead className="bg-white text-slate-850 font-bold border-b border-slate-300">
                            <tr>
                              <th className="px-4 py-3 border-r border-slate-300 uppercase font-extrabold w-[50%]">LEADING INDICATOR</th>
                              <th className="px-2 py-3 border-r border-slate-300 text-center uppercase font-extrabold w-[12%]">Target</th>
                              <th className="px-2 py-3 border-r border-slate-300 text-center uppercase font-extrabold w-[12%]">Aktual</th>
                              <th className="px-2 py-3 border-r border-slate-300 text-center uppercase font-extrabold w-[20%]">Sanksi Kerja</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-300">
                            {[
                              { key: "row1", text: "Pelaksanaan HSSE Management Walk Through (MWT)/ Manajemen Visit" },
                              { key: "row2", text: "Pemberian reward dan sanksi HSSE" },
                              { key: "row3", text: "Penyampaian laporan kinerja HSSE Pelaksana Kontrak kepada pertamina" },
                              { key: "row4", text: "Pelaksanaan HSSE Meeting" },
                              { key: "row5", text: "Mengikutsertakan pekerja dalam BPJS Ketenagakerjaan" },
                              { key: "row6", text: "Pelaksanaan HSSE Talk/ Tool Box Meeting" },
                              { key: "row7", text: "Pelaksanaan HSSE Induction" }
                            ].map((row) => (
                              <tr key={row.key} className="border-b border-slate-300 hover:bg-slate-50/50">
                                <td className="px-4 py-3 border-r border-slate-300 font-bold text-slate-800 leading-relaxed max-w-md">{row.text}</td>
                                <td className="p-1 border-r border-slate-300">
                                  <input type="text" placeholder="Target..." value={wipLeadingStep3[row.key].target} onChange={(e) => setWipLeadingStep3(prev => ({ ...prev, [row.key]: { ...prev[row.key], target: e.target.value } }))} className="w-full h-full bg-transparent px-2 py-1.5 text-center text-xs font-semibold text-slate-800 outline-none" />
                                </td>
                                <td className="p-1 border-r border-slate-300">
                                  <input type="text" placeholder="Aktual..." value={wipLeadingStep3[row.key].actual} onChange={(e) => setWipLeadingStep3(prev => ({ ...prev, [row.key]: { ...prev[row.key], actual: e.target.value } }))} className="w-full h-full bg-transparent px-2 py-1.5 text-center text-xs font-semibold text-slate-800 outline-none" />
                                </td>
                                <td className="p-1 border-r border-slate-300">
                                  <input type="text" placeholder="Sanksi..." value={wipLeadingStep3[row.key].sanksi} onChange={(e) => setWipLeadingStep3(prev => ({ ...prev, [row.key]: { ...prev[row.key], sanksi: e.target.value } }))} className="w-full h-full bg-transparent px-2 py-1.5 text-center text-xs font-semibold text-slate-800 outline-none" />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex justify-between items-center pt-4">
                        <button type="button" onClick={() => setWipStep(2)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-655 hover:bg-slate-50 active:scale-[0.98]">Back</button>
                        <button type="button" onClick={() => handleDocumentSubmit("WIP")} className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-650 px-8 py-3 text-xs font-extrabold text-white shadow-md hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] transition-all uppercase tracking-wider">Finish & Submit</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ============================================== */}
              {/* DOCUMENT PATH D: FE WORKFLOW (1 STEP) */}
              {/* ============================================== */}
              {activeDocumentType === "FE" && (
                <div className="rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm">
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handleDocumentSubmit("FE"); }} className="space-y-5" noValidate>
                      <div>
                        <h3 className="text-lg font-bold text-slate-905 border-b border-slate-100 pb-3">Create Final Evaluation (FE)</h3>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Judul Pekerjaan</label>
                        <input type="text" readOnly value={projectName} className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none cursor-not-allowed font-semibold" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="temuan" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Total Temuan Audit</label>
                          <input type="number" id="temuan" required min="0" placeholder="0" value={totalTemuan} onChange={(e) => setTotalTemuan(e.target.value)} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-semibold" />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="status-temuan" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Status Temuan Akhir</label>
                          <select id="status-temuan" value={statusTemuan} onChange={(e) => setStatusTemuan(e.target.value)} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-semibold">
                            <option value="Closed">Closed / Diselesaikan</option>
                            <option value="Open">Open / Terbuka</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="score" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Skor Kinerja Akhir Kontraktor (HSE Score 1-100)</label>
                        <input type="number" id="score" required min="1" max="100" placeholder="Masukkan nilai evaluasi (e.g. 92)..." value={hseScore} onChange={(e) => setHseScore(e.target.value)} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-semibold" />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="rekomendasi" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Rekomendasi Penutupan Kontrak</label>
                        <textarea id="rekomendasi" required rows={3} placeholder="Berikan catatan rekomendasi penutupan audit administrasi..." value={rekomendasiClose} onChange={(e) => setRekomendasiClose(e.target.value)} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-semibold" />
                      </div>
                    </form>

                    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-6">
                      <div className="space-y-4">
                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Document Preview (FE)</span>
                        <div className="relative border border-slate-300 rounded-lg bg-white p-6 shadow-inner aspect-[3/4] overflow-hidden flex flex-col justify-between text-slate-800 text-[8px] leading-relaxed select-none">
                          <div className="flex items-center justify-between border-b border-blue-900 pb-2">
                            <div className="text-left font-bold text-blue-955 text-[10px]">PERTAMINA</div>
                            <div className="text-right text-[6px] text-slate-400">No. Dok: HSE-FE-04</div>
                          </div>
                          <div className="text-center font-bold text-slate-900 uppercase my-3 space-y-1">
                            <p className="text-[9px]">FINAL PERFORMANCE EVALUATION</p>
                            <p className="text-[8px] text-blue-955 font-semibold">SERTIFIKASI KINERJA KONTRAKTOR HSSE</p>
                          </div>
                          <div className="flex-1 space-y-2 py-2 text-slate-650">
                            <p className="text-[7px] font-semibold">Temuan audit: {totalTemuan || "0"} ({statusTemuan}).</p>
                            <p className="text-[7px] font-semibold">HSE Score: {hseScore || "0"} / 100.</p>
                            <p className="text-[7px] font-semibold">Rekomendasi: {rekomendasiClose || "[Belum diisi]"}</p>
                          </div>
                          <div className="flex justify-end pt-2">
                            <div className="text-right w-24">
                              <p className="font-bold text-slate-800">Evaluator</p>
                              <div className="h-6 w-full flex items-center justify-center my-0.5 border border-dashed border-slate-200 text-slate-300 font-bold">Signature</div>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-3 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-700 font-bold text-xs shrink-0">PDF</span>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-900 truncate font-semibold">Final Evaluation Form.pdf</p>
                              <p className="text-[10px] text-slate-400 font-semibold">1.2 MB</p>
                            </div>
                          </div>
                          <button type="button" onClick={() => alert("Simulating PDF full view...")} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-650 hover:bg-slate-50 transition-colors">View File</button>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-3 mt-6 border-t border-slate-200 pt-4">
                        <button type="button" onClick={() => { setCurrentView("overview"); setSelectedCategory("All"); }} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-650 transition-colors hover:bg-slate-50">Cancel</button>
                        <button type="button" onClick={() => handleDocumentSubmit("FE")} className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-650 px-8 py-3 text-xs font-extrabold text-white shadow-md hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] transition-all uppercase tracking-wider">Finish & Submit</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

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
