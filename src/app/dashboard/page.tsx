"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

// Document type definition
interface DocumentItem {
  no: number;
  nama: string;
  added: string;
  addedDate: Date;
  status: "New" | "On Progress" | "Done";
  type: "HSE Plan" | "PJA" | "WIP" | "FE";
}

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortField, setSortField] = useState<"nama" | "added">("nama");
  const [sortAsc, setSortAsc] = useState(true);

  // Core navigation state:
  // "overview" = main metrics and table
  // "create-document" = document workspace (subpath activeDocumentType)
  const [currentView, setCurrentView] = useState<"overview" | "create-document">("overview");
  const [activeDocumentType, setActiveDocumentType] = useState<"HSE Plan" | "PJA" | "WIP" | "FE">("HSE Plan");

  // HSE Plan Flow Steps:
  // Step 1: General Info Form + PDF Preview
  // Step 2: HSE Plan - Form Proses 1 detailed scoring tables (page 1/8)
  // Step 3: HSE Plan - Form Proses 2 detailed scoring tables (page 2/8)
  const [hsePlanStep, setHsePlanStep] = useState<1 | 2 | 3>(1);

  // HSE Plan Header Inputs
  const [vendorName, setVendorName] = useState("PT Warna SeBahtera");
  const [projectName, setProjectName] = useState("Pengadaan Time Charter 1 (one) Unit VLGC Laycan 19-20 Februari 2024 (LPGC SC Commander LVII)");
  const [evaluationDate, setEvaluationDate] = useState("2024-02-22");
  const [evaluatorName, setEvaluatorName] = useState("PUTRI FATIMA SUNNIA");

  // HSE Plan Step 1 Info
  const [lokasiPekerjaan, setLokasiPekerjaan] = useState("");
  const [picJabatan, setPicJabatan] = useState("");

  // HSE Plan Step 2 (Form Proses 1) Matrix Scores (options: 0, 0.25, 0.50, 1.00)
  const [matrixScores, setMatrixScores] = useState<Record<string, number>>({
    score1: 0.25, // Program kampanye
    score2: 0,    // HSSE Meeting
    score3: 0,    // Management Walkthrough
    score4: 0,    // Intervensi
    score5: 0,    // Penerapan CLSR
    score6: 0,    // Reward
    score7: 0,    // Sanksi
  });

  // HSE Plan Step 3 (Form Proses 2) Matrix Scores
  const [matrixStep3Scores, setMatrixStep3Scores] = useState<Record<string, number>>({
    score3_1: 0, // Pencegahan kecelakaan
    score3_2: 0, // Mematuhi peraturan
    score3_3: 0, // Menyediakan pekerja
    score3_4: 0, // Perbaikan berkesinambungan
    score3_5: 0, // Melarang obat-obatan
    score3_6: 0, // Menetapkan target
    score3_7: 0, // Lagging
    score3_8: 0, // Leading
    score3_9: 0, // KPI format Pertamina
  });

  const handleMatrixChange = (key: string, val: number) => {
    setMatrixScores((prev) => ({ ...prev, [key]: val }));
  };

  const handleStep3MatrixChange = (key: string, val: number) => {
    setMatrixStep3Scores((prev) => ({ ...prev, [key]: val }));
  };

  // Computations for Step 2 Table 1 (Budaya HSSE)
  const table1Total = useMemo(() => {
    const sum = (matrixScores.score1 + matrixScores.score2 + matrixScores.score3 + matrixScores.score4 + matrixScores.score5) * 4;
    return parseFloat(sum.toFixed(2));
  }, [matrixScores]);

  // Computations for Step 2 Table 2 (Reward & Sanksi)
  const table2Total = useMemo(() => {
    const sum = (matrixScores.score6 + matrixScores.score7) * 4;
    return parseFloat(sum.toFixed(2));
  }, [matrixScores]);

  const totalProses1 = useMemo(() => {
    return parseFloat((table1Total + table2Total).toFixed(2));
  }, [table1Total, table2Total]);

  // Computations for Step 3 Table 1 (HSSE Policy & Objective)
  const step3Table1Total = useMemo(() => {
    const sum = (
      matrixStep3Scores.score3_1 +
      matrixStep3Scores.score3_2 +
      matrixStep3Scores.score3_3 +
      matrixStep3Scores.score3_4 +
      matrixStep3Scores.score3_5 +
      matrixStep3Scores.score3_6
    ) * 4;
    return parseFloat(sum.toFixed(2));
  }, [matrixStep3Scores]);

  // Computations for Step 3 Table 2 (HSSE Performance Indicator / KPI)
  const step3Table2Total = useMemo(() => {
    const sum = (
      matrixStep3Scores.score3_7 +
      matrixStep3Scores.score3_8 +
      matrixStep3Scores.score3_9
    ) * 4;
    return parseFloat(sum.toFixed(2));
  }, [matrixStep3Scores]);

  const totalProses2 = useMemo(() => {
    return parseFloat((step3Table1Total + step3Table2Total).toFixed(2));
  }, [step3Table1Total, step3Table2Total]);

  // Form states - PJA
  const [potensiBahaya, setPotensiBahaya] = useState("");
  const [tindakanPencegahan, setTindakanPencegahan] = useState("");
  const [apdDiperlukan, setApdDiperlukan] = useState("");
  const [tanggalPJA, setTanggalPJA] = useState("");

  // Form states - WIP
  const [deskripsiAktivitas, setDeskripsiAktivitas] = useState("");
  const [patrolSafety, setPatrolSafety] = useState("");
  const [safeManHours, setSafeManHours] = useState("");

  // Form states - FE
  const [totalTemuan, setTotalTemuan] = useState("");
  const [statusTemuan, setStatusTemuan] = useState("Closed");
  const [hseScore, setHseScore] = useState("");
  const [rekomendasiClose, setRekomendasiClose] = useState("");

  const formRef = useRef<HTMLFormElement>(null);

  // Hardcoded document list from user reference
  const [documents, setDocuments] = useState<DocumentItem[]>([
    {
      no: 1,
      nama: "Pengadaan Time Charter 1 (one) Unit VLGC Laycan 19-20 Februari 2024 (LPGC SC Commander LVII)",
      added: "23-Nov-2025",
      addedDate: new Date("2025-11-23"),
      status: "New",
      type: "HSE Plan",
    },
    {
      no: 2,
      nama: "Pengadaan Time Charter 1 (satu) Unit Small 2 LPGC Pressurized Laycan 20-21 Februari 2024 (LPGC Gas Laura)",
      added: "19-Oct-2025",
      addedDate: new Date("2025-10-19"),
      status: "New",
      type: "HSE Plan",
    },
    {
      no: 3,
      nama: "LPGC Jenggala",
      added: "06-Aug-2025",
      addedDate: new Date("2025-08-06"),
      status: "Done",
      type: "PJA",
    },
    {
      no: 4,
      nama: "Time Charter 1 (satu) Unit Small 2 LPGC Pressurized Laycan 10-11 Maret 2024 (LPGC Gas Artemis)",
      added: "10-May-2025",
      addedDate: new Date("2025-05-10"),
      status: "Done",
      type: "PJA",
    },
    {
      no: 5,
      nama: "Pengadaan Time Charter 1 (satu) unit small LPGC Pressurized Laycan 25-26 April 2024 (LPGC Gas Indonesia II)",
      added: "10-May-2025",
      addedDate: new Date("2025-05-10"),
      status: "Done",
      type: "WIP",
    },
    {
      no: 6,
      nama: "Pengadaan Time Charter 1 (satu) unit small LPGC Pressurized Laycan 23-24 Mei 2024 (LPGC Gas Kalimantan)",
      added: "10-May-2025",
      addedDate: new Date("2025-05-10"),
      status: "On Progress",
      type: "WIP",
    },
    {
      no: 7,
      nama: "Pengadaan COA 1 (satu) Unit Small 1 LPGC Pressurized Laycan 10-12 Juni 2024 (LPGC AE Gas)",
      added: "10-May-2025",
      addedDate: new Date("2025-05-10"),
      status: "On Progress",
      type: "WIP",
    },
    {
      no: 8,
      nama: "Pengadaan Time Charter 1 (satu) Unit Midsize LPG Laycan 24-25 Juni 2024 (LPGC Gas Nusa)",
      added: "10-May-2025",
      addedDate: new Date("2025-05-10"),
      status: "Done",
      type: "FE",
    },
    {
      no: 9,
      nama: "Pengadaan Time Charter 1 (satu) Unit Midsize LPG Laycan 15-16 Juli 2024 (LPGC Gas Sofia)",
      added: "12-Apr-2025",
      addedDate: new Date("2025-04-12"),
      status: "Done",
      type: "FE",
    },
  ]);

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
        let valA: any = sortField === "nama" ? a.nama : a.addedDate.getTime();
        let valB: any = sortField === "nama" ? b.nama : b.addedDate.getTime();

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

    alert(`${type} document created successfully! (Simulation)`);
    
    // Add new document simulation
    const newDoc: DocumentItem = {
      no: documents.length + 1,
      nama: projectName,
      added: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-"),
      addedDate: new Date(),
      status: "Done",
      type: type,
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setCurrentView("overview");
    setSelectedCategory("All");
    setHsePlanStep(1);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-20 flex w-72 flex-col border-r border-slate-200 bg-white">
        {/* App Logo */}
        <div className="flex h-16 items-center gap-2.5 px-6 border-b border-slate-100">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-base shadow-md shadow-blue-500/10">
            C
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            CSMS Portal
          </span>
        </div>

        {/* Navigation Section */}
        <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6 space-y-7">
          {/* Main Menus */}
          <div className="space-y-1.5">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Overview
            </p>
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home Page
            </Link>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setCurrentView("overview");
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                selectedCategory === "All" && currentView === "overview"
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className="flex items-center gap-3">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                All Documents
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                selectedCategory === "All" && currentView === "overview" ? "bg-blue-200/50 text-blue-800" : "bg-slate-100 text-slate-600"
              }`}>
                {stats.total}
              </span>
            </button>
          </div>

          {/* Documents Section */}
          <div className="space-y-1.5">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Documents
            </p>
            {[
              { id: "HSE Plan", name: "HSE Plan", count: "45/80" },
              { id: "PJA", name: "Pre-Job Assessment (PJA)", count: "28/80" },
              { id: "WIP", name: "Work In Progress (WIP)", count: "19/80" },
              { id: "FE", name: "Final Evaluation (FE)", count: "8/80" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setActiveDocumentType(cat.id as any);
                  setCurrentView("create-document");
                  setHsePlanStep(1); // Default to step 1
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                  selectedCategory === cat.id && currentView === "create-document"
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    cat.id === "HSE Plan" ? "bg-red-500" :
                    cat.id === "PJA" ? "bg-blue-500" :
                    cat.id === "WIP" ? "bg-amber-500" : "bg-green-500"
                  }`} />
                  {cat.id}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Quick List (Bottom lists of procurements) */}
          <div className="space-y-2">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Procurements List
            </p>
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
              {documents.map((doc) => (
                <button
                  key={doc.no}
                  onClick={() => {
                    setSearchQuery(doc.nama);
                    setSelectedCategory("All");
                    setCurrentView("overview");
                  }}
                  className="w-full text-left truncate text-xs text-slate-500 hover:text-blue-600 rounded px-3 py-1.5 transition-colors hover:bg-slate-50"
                  title={doc.nama}
                >
                  • {doc.nama}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User profile footer info */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-md">
              PS
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                PUTRI FATIMA SUNNIA
              </p>
              <p className="truncate text-xs text-slate-400">
                putri.fatima@pertamina.com
              </p>
            </div>
          </div>
          <div className="mt-3 text-[10px] font-semibold text-blue-600 bg-blue-50 rounded px-2.5 py-1 text-center truncate">
            Environmental & HSSE Governance
          </div>
        </div>
      </aside>

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
                : activeDocumentType === "HSE Plan"
                ? `Step ${hsePlanStep} of 3`
                : "Form Setup"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-950">PUTRI FATIMA SUNNIA</p>
              <p className="text-[10px] font-medium text-slate-400">HSSE Governance Officer</p>
            </div>
            <div className="h-10 w-10 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm shadow-inner">
              PS
            </div>
          </div>
        </header>

        {/* Dynamic View rendering */}
        <main className="flex-1 p-8 space-y-8 max-w-7xl w-full mx-auto">
          
          {/* Main header banner card */}
          <div className="relative overflow-hidden rounded-2xl bg-slate-900 h-52 shadow-lg shadow-slate-950/5">
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
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-semibold text-slate-400 bg-white border border-slate-100 rounded-xl px-5 py-3 shadow-sm">
            <span className={activeDocumentType === "HSE Plan" && currentView === "create-document" ? "text-red-600 font-extrabold" : "text-red-500"}>HSE Plan</span>
            <span className="text-slate-300">•</span>
            <span className={activeDocumentType === "PJA" && currentView === "create-document" ? "text-blue-600 font-extrabold" : "text-blue-500"}>Pre-Job Assessment</span>
            <span className="text-slate-300">•</span>
            <span className={activeDocumentType === "WIP" && currentView === "create-document" ? "text-amber-600 font-extrabold" : "text-amber-500"}>Work In Progress</span>
            <span className="text-slate-300">•</span>
            <span className={activeDocumentType === "FE" && currentView === "create-document" ? "text-green-600 font-extrabold" : "text-green-500"}>Final Evaluation</span>
          </div>

          {currentView === "overview" ? (
            /* ======================================================== */
            /* VIEW A: DASHBOARD OVERVIEW */
            /* ======================================================== */
            <>
              {/* KPI Dashboard Section Grid */}
              <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { id: "HSE Plan", name: "HSE Plan", value: "45/80", pct: 56.2, color: "from-red-500 to-rose-600", light: "bg-red-50 text-red-600 border-red-100" },
                  { id: "PJA", name: "PJA", value: "28/80", pct: 35.0, color: "from-blue-500 to-indigo-600", light: "bg-blue-50 text-blue-600 border-blue-100" },
                  { id: "WIP", name: "WIP", value: "19/80", pct: 23.7, color: "from-amber-500 to-yellow-600", light: "bg-amber-50 text-amber-600 border-amber-100" },
                  { id: "FE", name: "FE", value: "8/80", pct: 10.0, color: "from-green-500 to-emerald-600", light: "bg-green-50 text-green-600 border-green-100" },
                ].map((kpi) => (
                  <button
                    key={kpi.id}
                    onClick={() => {
                      setSelectedCategory(kpi.id);
                      setActiveDocumentType(kpi.id as any);
                      setCurrentView("create-document");
                      setHsePlanStep(1);
                    }}
                    className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md hover:border-slate-300 text-left"
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
                      <p className="text-2xl font-extrabold tracking-tight text-slate-900">
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
                    <h3 className="text-base font-bold text-slate-900">Task Status Summary</h3>
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
                      <p className="text-3xl font-extrabold text-slate-900">{stats.total}</p>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Docs</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Done ({stats.doneCount})
                      </span>
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        Active ({stats.progressCount})
                      </span>
                    </div>
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        New ({stats.newCount})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Phase Completion Progression</h3>
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
                    <h3 className="text-base font-bold text-slate-900">Safety Alerts & Deadlines</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Action items requiring attention</p>
                  </div>
                  <div className="space-y-3.5 my-4">
                    <div className="rounded-xl border border-red-100 bg-red-50/50 p-3">
                      <div className="flex items-start gap-2.5">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">!</span>
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
                    className="w-full rounded-xl border border-slate-200 py-2.5 text-center text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 active:scale-[0.99]"
                  >
                    View Full Audit Logs
                  </button>
                </div>
              </section>

              {/* PROCUREMENT DATA TABLE */}
              <section className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm space-y-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Procurement Audit Documents</h3>
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
                        setSelectedCategory(cat);
                        if (cat !== "All") {
                          setActiveDocumentType(cat as any);
                          setCurrentView("create-document");
                          setHsePlanStep(1);
                        }
                      }}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all ${
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
                                    ? "bg-red-50 border-red-100 text-red-700"
                                    : doc.status === "On Progress"
                                    ? "bg-blue-50 border-blue-100 text-blue-700"
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
                            No documents matching "{searchQuery}" in category "{selectedCategory}"
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
                  <p>Showing {filteredAndSortedDocuments.length} of {documents.length} procurements</p>
                  <div className="flex items-center gap-1.5 font-semibold text-blue-600">
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
              
              {/* ============================================== */}
              {/* DOCUMENT PATH A: HSE PLAN WORKFLOW (3 STEPS) */}
              {/* ============================================== */}
              {activeDocumentType === "HSE Plan" && (
                <>
                  {hsePlanStep === 1 && (
                    /* HSE Plan Step 1: Info Form + PDF Preview */
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-5 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm md:grid-cols-3">
                        <div className="md:col-span-2 space-y-2.5">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex rounded-lg bg-red-50 px-2.5 py-1 text-xs font-bold border border-red-100 text-red-600">
                              HSE Plan
                            </span>
                          </div>
                          <h2 className="text-base font-bold leading-normal text-slate-900">
                            {projectName}
                          </h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4 border-l border-slate-100 pl-6 md:grid-cols-1 md:border-l md:pl-6 md:space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</label>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">On Review by PIC</div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Edit</label>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">22 February 2026</div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm">
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                          <form ref={formRef} onSubmit={(e) => { e.preventDefault(); if (formRef.current?.checkValidity()) { setHsePlanStep(2); } else { formRef.current?.reportValidity(); } }} className="space-y-5" noValidate>
                            <div>
                              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">HSE Plan Form</h3>
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Judul Pekerjaan</label>
                              <input type="text" readOnly value={projectName} className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none cursor-not-allowed" />
                            </div>
                            <div className="space-y-1.5">
                              <label htmlFor="lokasi-hse" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Lokasi Pekerjaan</label>
                              <input type="text" id="lokasi-hse" required placeholder="Masukkan lokasi pekerjaan..." value={lokasiPekerjaan} onChange={(e) => setLokasiPekerjaan(e.target.value)} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
                              <div className="error-msg text-[10px] font-semibold text-red-600 mt-1">Lokasi pekerjaan diperlukan.</div>
                            </div>
                            <div className="space-y-1.5">
                              <label htmlFor="perusahaan-hse" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Perusahaan</label>
                              <input type="text" id="perusahaan-hse" required placeholder="Masukkan nama perusahaan..." value={vendorName} onChange={(e) => setVendorName(e.target.value)} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
                              <div className="error-msg text-[10px] font-semibold text-red-600 mt-1">Nama perusahaan diperlukan.</div>
                            </div>
                            <div className="space-y-1.5">
                              <label htmlFor="tgl-hse" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal Verifikasi</label>
                              <input type="date" id="tgl-hse" required value={evaluationDate} onChange={(e) => setEvaluationDate(e.target.value)} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
                              <div className="error-msg text-[10px] font-semibold text-red-600 mt-1">Tanggal verifikasi diperlukan.</div>
                            </div>
                            <div className="space-y-1.5">
                              <label htmlFor="evaluator-hse" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Evaluator</label>
                              <input type="text" id="evaluator-hse" required placeholder="Masukkan nama evaluator..." value={evaluatorName} onChange={(e) => setEvaluatorName(e.target.value)} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
                              <div className="error-msg text-[10px] font-semibold text-red-600 mt-1">Nama evaluator diperlukan.</div>
                            </div>
                            <div className="space-y-1.5">
                              <label htmlFor="pic-hse" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">PIC - Jabatan</label>
                              <input type="text" id="pic-hse" required placeholder="Masukkan jabatan PIC..." value={picJabatan} onChange={(e) => setPicJabatan(e.target.value)} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
                              <div className="error-msg text-[10px] font-semibold text-red-600 mt-1">PIC Jabatan diperlukan.</div>
                            </div>
                          </form>

                          <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-6">
                            <div className="space-y-4">
                              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Document Preview (HSE Plan)</span>
                              <div className="relative border border-slate-300 rounded-lg bg-white p-6 shadow-inner aspect-[3/4] overflow-hidden flex flex-col justify-between text-slate-800 text-[8px] leading-relaxed select-none">
                                <div className="flex items-center justify-between border-b border-blue-900 pb-2">
                                  <div className="text-left font-bold text-blue-900 text-[10px]">PERTAMINA</div>
                                  <div className="text-right text-[6px] text-slate-400">No. Dok: HSE-CSMS-01</div>
                                </div>
                                <div className="text-center font-bold text-slate-900 uppercase my-3 space-y-1">
                                  <p className="text-[9px]">Surat Keputusan</p>
                                  <p className="text-[7px] text-slate-500">No. Kpts - 24 / C00000/2026-S0</p>
                                  <p className="text-[8px] tracking-tight text-blue-950 mt-1">TENTANG PEMBERLAKUAN PEDOMAN CONTRACTOR SAFETY MANAGEMENT SYSTEM (CSMS)</p>
                                </div>
                                <div className="flex-1 space-y-2 py-2 text-slate-600">
                                  <p className="font-semibold text-slate-800">DIREKTUR UTAMA PT PERTAMINA (PERSERO),</p>
                                  <p className="text-[7px]">Sistem Manajemen Keselamatan Kontraktor (CSMS) wajib dipenuhi untuk memitigasi seluruh aktivitas operasional di kapal VLGC Laycan.</p>
                                </div>
                                <div className="flex justify-end pt-2">
                                  <div className="text-right w-24">
                                    <p>Jakarta, 2026</p>
                                    <p className="font-bold text-slate-800">Direktur Utama</p>
                                    <div className="h-6 w-full flex items-center justify-center my-0.5 border border-dashed border-slate-200 text-slate-300">Signature</div>
                                    <p className="font-bold text-slate-800 underline">Nicke Widyawati</p>
                                  </div>
                                </div>
                              </div>
                              <div className="rounded-xl border border-slate-200 bg-white p-3 flex items-center justify-between">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-700 font-bold text-xs shrink-0">PDF</span>
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-slate-900 truncate">HSE Plan - Pedoman CSMS Pertamina.pdf</p>
                                    <p className="text-[10px] text-slate-400">1.8 MB</p>
                                  </div>
                                </div>
                                <button type="button" onClick={() => alert("Simulating PDF full view...")} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50">View File</button>
                              </div>
                            </div>
                            <div className="flex items-center justify-end gap-3 mt-6 border-t border-slate-200 pt-4">
                              <button type="button" onClick={() => { setCurrentView("overview"); setSelectedCategory("All"); }} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50">Cancel</button>
                              <button type="button" onClick={() => { if (lokasiPekerjaan && picJabatan) { setHsePlanStep(2); } else { formRef.current?.reportValidity(); } }} className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98]">Continue</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {hsePlanStep === 2 && (
                    /* HSE Plan Step 2: Form Proses 1 scoring tables (page 1/8) */
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-5 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm md:grid-cols-4">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Vendor Name:</label>
                          <input type="text" value={vendorName} onChange={(e) => setVendorName(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Project Name:</label>
                          <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Evaluation Date:</label>
                          <input type="date" value={evaluationDate} onChange={(e) => setEvaluationDate(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Evaluator:</label>
                          <input type="text" value={evaluatorName} onChange={(e) => setEvaluatorName(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none" />
                        </div>
                        <div className="md:col-span-4 text-right text-[10px] text-slate-400 font-medium pt-1">
                          Last update: 5 Maret 2026
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                          <select className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:bg-white">
                            <option>Proses I : Kepemimpinan dan Akuntabilitas</option>
                          </select>
                        </div>

                        <div className="space-y-3">
                          <p className="text-xs font-bold text-slate-700">
                            1. Promosi budaya HSSE yang melibatkan level Manajemen yang akan dilaksanakan selama pelaksanaan Pekerjaan Kontrak yang mencakup :
                          </p>
                          <div className="overflow-x-auto rounded-xl border border-slate-100">
                            <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                              <thead className="bg-slate-50 font-bold text-slate-500">
                                <tr>
                                  <th scope="col" className="px-4 py-3">KOMPONEN PENILAIAN HSE PLAN</th>
                                  <th scope="col" className="px-4 py-3 w-20 text-center">BOBOT</th>
                                  <th scope="col" className="px-4 py-3 w-32">Nilai Matriks</th>
                                  <th scope="col" className="px-4 py-3 w-24 text-center">Nilai x Bobot</th>
                                  <th scope="col" className="px-4 py-3 w-36">Keterangan</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-700">
                                {[
                                  { key: "score1", name: "Program kampanye/ Training HSSE" },
                                  { key: "score2", name: "HSSE Meeting" },
                                  { key: "score3", name: "Management Walkthrough/ Inspeksi oleh Manajemen" },
                                  { key: "score4", name: "Intervensi terhadap kondisi dan perilaku Sub Standard" },
                                  { key: "score5", name: "Penerapan Corporate Life Saving Rules (CLSR) Pertamina" },
                                ].map((row) => (
                                  <tr key={row.key} className="hover:bg-slate-50/50">
                                    <td className="px-4 py-3 font-semibold text-slate-800">{row.name}</td>
                                    <td className="px-4 py-3 text-center">4</td>
                                    <td className="px-4 py-2">
                                      <select
                                        value={matrixScores[row.key]}
                                        onChange={(e) => handleMatrixChange(row.key, parseFloat(e.target.value))}
                                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none focus:bg-white w-full"
                                      >
                                        <option value="0">0.00</option>
                                        <option value="0.25">0.25</option>
                                        <option value="0.50">0.50</option>
                                        <option value="1.00">1.00</option>
                                      </select>
                                    </td>
                                    <td className="px-4 py-3 text-center text-slate-900 font-bold">
                                      {(matrixScores[row.key] * 4).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-2">
                                      <input type="text" placeholder="Catatan..." className="w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 outline-none text-xs py-1" />
                                    </td>
                                  </tr>
                                ))}
                                <tr className="bg-slate-50/50 font-bold">
                                  <td className="px-4 py-3 text-right">Total</td>
                                  <td className="px-4 py-3 text-center">20</td>
                                  <td className="px-4 py-3"></td>
                                  <td className="px-4 py-3 text-center text-slate-950 text-sm">{table1Total.toFixed(2)}</td>
                                  <td className="px-4 py-3"></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-xs font-bold text-slate-700">
                            2. Penghargaan dan Sanksi terkait Aspek HSSE
                          </p>
                          <div className="overflow-x-auto rounded-xl border border-slate-100">
                            <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                              <thead className="bg-slate-50 font-bold text-slate-500">
                                <tr>
                                  <th scope="col" className="px-4 py-3">KOMPONEN PENILAIAN HSE PLAN</th>
                                  <th scope="col" className="px-4 py-3 w-20 text-center">BOBOT</th>
                                  <th scope="col" className="px-4 py-3 w-32">Nilai Matriks</th>
                                  <th scope="col" className="px-4 py-3 w-24 text-center">Nilai x Bobot</th>
                                  <th scope="col" className="px-4 py-3 w-36">Keterangan</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-700">
                                {[
                                  { key: "score6", name: "Pemberlakuan sistem Reward terhadap kinerja HSSE yang baik/ upaya pro aktif" },
                                  { key: "score7", name: "Sanksi bagi pekerja yang melakukan pelanggaran aspek HSSE" },
                                ].map((row) => (
                                  <tr key={row.key} className="hover:bg-slate-50/50">
                                    <td className="px-4 py-3 font-semibold text-slate-800">{row.name}</td>
                                    <td className="px-4 py-3 text-center">4</td>
                                    <td className="px-4 py-2">
                                      <select
                                        value={matrixScores[row.key]}
                                        onChange={(e) => handleMatrixChange(row.key, parseFloat(e.target.value))}
                                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none focus:bg-white w-full"
                                      >
                                        <option value="0">0.00</option>
                                        <option value="0.25">0.25</option>
                                        <option value="0.50">0.50</option>
                                        <option value="1.00">1.00</option>
                                      </select>
                                    </td>
                                    <td className="px-4 py-3 text-center text-slate-900 font-bold">
                                      {(matrixScores[row.key] * 4).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-2">
                                      <input type="text" placeholder="Catatan..." className="w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 outline-none text-xs py-1" />
                                    </td>
                                  </tr>
                                ))}
                                <tr className="bg-slate-50/50 font-bold">
                                  <td className="px-4 py-3 text-right">Total</td>
                                  <td className="px-4 py-3 text-center">8</td>
                                  <td className="px-4 py-3"></td>
                                  <td className="px-4 py-3 text-center text-slate-950 text-sm">{table2Total.toFixed(2)}</td>
                                  <td className="px-4 py-3"></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-5 items-center font-bold text-xs">
                          <div className="text-slate-500 uppercase tracking-wider">Total Proses 1</div>
                          <div className="text-center text-sm text-slate-950 bg-slate-50 border border-slate-200 rounded px-4 py-1.5">{totalProses1.toFixed(2)}</div>
                          <div></div>
                        </div>

                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row border-t border-slate-100 pt-5">
                          <div className="text-xs text-slate-400 font-semibold select-none">&lt; 1/8 &gt;</div>
                          
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Semua Proses</span>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-2 text-sm font-extrabold text-blue-700">
                              {totalProses1.toFixed(2)}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button type="button" onClick={() => setHsePlanStep(1)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50">&lt; Back</button>
                            <button type="button" onClick={() => setHsePlanStep(3)} className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98]">Next &gt;</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {hsePlanStep === 3 && (
                    /* HSE Plan Step 3: Form Proses 2 scoring tables (page 2/8) (Matches the new reference image perfectly) */
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-5 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm md:grid-cols-4">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Vendor Name:</label>
                          <input type="text" readOnly value={vendorName} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 outline-none cursor-not-allowed" />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Project Name:</label>
                          <input type="text" readOnly value={projectName} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 outline-none cursor-not-allowed" />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Evaluation Date:</label>
                          <input type="date" readOnly value={evaluationDate} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 outline-none cursor-not-allowed" />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Evaluator:</label>
                          <input type="text" readOnly value={evaluatorName} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 outline-none cursor-not-allowed" />
                        </div>
                        <div className="md:col-span-4 text-right text-[10px] text-slate-400 font-medium pt-1">
                          Last update: 5 Maret 2026
                        </div>
                      </div>

                      {/* Process 2 Table Assessment */}
                      <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                          <select className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:bg-white">
                            <option>PROSES 2. KEBIJAKAN DAN SASARAN</option>
                          </select>
                        </div>

                        {/* HSSE Policy and Objective Section */}
                        <div className="space-y-4">
                          <p className="text-xs font-bold text-slate-700">1. HSSE Policy Dan Objective</p>
                          
                          {/* Komitmen HSSE sub-table */}
                          <div className="space-y-2 pl-4">
                            <p className="text-xs font-semibold text-slate-600">1. Komitmen HSSE</p>
                            <div className="overflow-x-auto rounded-xl border border-slate-100">
                              <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                                <thead className="bg-slate-50 font-bold text-slate-500">
                                  <tr>
                                    <th scope="col" className="px-4 py-3">KOMPONEN PENILAIAN HSE PLAN</th>
                                    <th scope="col" className="px-4 py-3 w-20 text-center">BOBOT</th>
                                    <th scope="col" className="px-4 py-3 w-32">Nilai Matriks</th>
                                    <th scope="col" className="px-4 py-3 w-24 text-center">Nilai x Bobot</th>
                                    <th scope="col" className="px-4 py-3 w-36">Keterangan</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-700">
                                  {[
                                    { key: "score3_1", name: "Pencegahan kecelakaan, luka dan sakit akibat kerja" },
                                    { key: "score3_2", name: "Mematuhi segala peraturan HSSE yang berlaku" },
                                    { key: "score3_3", name: "Menyediakan pekerja yang telah memahami/memenuhi persyaratan keahlian dalam aspek HSSE" },
                                    { key: "score3_4", name: "Melakukan perbaikan berkesinambungan terhadap kinerja HSSE" },
                                    { key: "score3_5", name: "Melarang penggunaan obat-obatan terlarang, minuman keras, penggunaan senjata api, berjudi dan berkelahi." },
                                  ].map((row) => (
                                    <tr key={row.key} className="hover:bg-slate-50/50">
                                      <td className="px-4 py-3 font-semibold text-slate-800">{row.name}</td>
                                      <td className="px-4 py-3 text-center">4</td>
                                      <td className="px-4 py-2">
                                        <select
                                          value={matrixStep3Scores[row.key]}
                                          onChange={(e) => handleStep3MatrixChange(row.key, parseFloat(e.target.value))}
                                          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none focus:bg-white w-full"
                                        >
                                          <option value="0">0.00</option>
                                          <option value="0.25">0.25</option>
                                          <option value="0.50">0.50</option>
                                          <option value="1.00">1.00</option>
                                        </select>
                                      </td>
                                      <td className="px-4 py-3 text-center text-slate-900 font-bold">
                                        {(matrixStep3Scores[row.key] * 4).toFixed(2)}
                                      </td>
                                      <td className="px-4 py-2">
                                        <input type="text" placeholder="Catatan..." className="w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 outline-none text-xs py-1" />
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Target Kebijakan HSSE sub-table */}
                          <div className="space-y-2 pl-4">
                            <p className="text-xs font-semibold text-slate-600">2. Target kebijakan HSSE</p>
                            <div className="overflow-x-auto rounded-xl border border-slate-100">
                              <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                                <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-700">
                                  <tr className="hover:bg-slate-50/50">
                                    <td className="px-4 py-3 font-semibold text-slate-800">Menetapkan target pencapaian HSSE dalam kebijakan HSSE</td>
                                    <td className="px-4 py-3 w-20 text-center">4</td>
                                    <td className="px-4 py-2 w-32">
                                      <select
                                        value={matrixStep3Scores.score3_6}
                                        onChange={(e) => handleStep3MatrixChange("score3_6", parseFloat(e.target.value))}
                                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none focus:bg-white w-full"
                                      >
                                        <option value="0">0.00</option>
                                        <option value="0.25">0.25</option>
                                        <option value="0.50">0.50</option>
                                        <option value="1.00">1.00</option>
                                      </select>
                                    </td>
                                    <td className="px-4 py-3 w-24 text-center text-slate-900 font-bold">
                                      {(matrixStep3Scores.score3_6 * 4).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-2 w-36">
                                      <input type="text" placeholder="Catatan..." className="w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 outline-none text-xs py-1" />
                                    </td>
                                  </tr>
                                  <tr className="bg-slate-50/50 font-bold">
                                    <td className="px-4 py-3 text-right">Total</td>
                                    <td className="px-4 py-3 text-center">24</td>
                                    <td className="px-4 py-3"></td>
                                    <td className="px-4 py-3 text-center text-slate-950 text-sm">{step3Table1Total.toFixed(2)}</td>
                                    <td className="px-4 py-3"></td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>

                        {/* HSSE Performance Indicator / KPI Section */}
                        <div className="space-y-4">
                          <p className="text-xs font-bold text-slate-700">2. HSSE PERFORMANCE INDICATOR / KPI (KEY PERFORMANCE INDICATOR)</p>
                          <div className="space-y-2 pl-4">
                            <p className="text-xs font-semibold text-slate-600">1. Menyusun indikator pencapaian kinerja (KPI) HSSE yang terdiri dari :</p>
                            <div className="overflow-x-auto rounded-xl border border-slate-100">
                              <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                                <thead className="bg-slate-50 font-bold text-slate-500">
                                  <tr>
                                    <th scope="col" className="px-4 py-3">KOMPONEN PENILAIAN HSE PLAN</th>
                                    <th scope="col" className="px-4 py-3 w-20 text-center">BOBOT</th>
                                    <th scope="col" className="px-4 py-3 w-32">Nilai Matriks</th>
                                    <th scope="col" className="px-4 py-3 w-24 text-center">Nilai x Bobot</th>
                                    <th scope="col" className="px-4 py-3 w-36">Keterangan</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-700">
                                  {[
                                    { key: "score3_7", name: "Lagging Indicator" },
                                    { key: "score3_8", name: "Leading Indicator" },
                                    { key: "score3_9", name: "KPI HSSE yang disusun sesuai format Pertamina" },
                                  ].map((row) => (
                                    <tr key={row.key} className="hover:bg-slate-50/50">
                                      <td className="px-4 py-3 font-semibold text-slate-800">{row.name}</td>
                                      <td className="px-4 py-3 text-center">4</td>
                                      <td className="px-4 py-2">
                                        <select
                                          value={matrixStep3Scores[row.key]}
                                          onChange={(e) => handleStep3MatrixChange(row.key, parseFloat(e.target.value))}
                                          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none focus:bg-white w-full"
                                        >
                                          <option value="0">0.00</option>
                                          <option value="0.25">0.25</option>
                                          <option value="0.50">0.50</option>
                                          <option value="1.00">1.00</option>
                                        </select>
                                      </td>
                                      <td className="px-4 py-3 text-center text-slate-900 font-bold">
                                        {(matrixStep3Scores[row.key] * 4).toFixed(2)}
                                      </td>
                                      <td className="px-4 py-2">
                                        <input type="text" placeholder="Catatan..." className="w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 outline-none text-xs py-1" />
                                      </td>
                                    </tr>
                                  ))}
                                  <tr className="bg-slate-50/50 font-bold">
                                    <td className="px-4 py-3 text-right">Total</td>
                                    <td className="px-4 py-3 text-center">12</td>
                                    <td className="px-4 py-3"></td>
                                    <td className="px-4 py-3 text-center text-slate-950 text-sm">{step3Table2Total.toFixed(2)}</td>
                                    <td className="px-4 py-3"></td>
                                  </tr>
                                  <tr className="bg-slate-100/50 font-extrabold text-slate-900">
                                    <td className="px-4 py-3 text-right">Total Proses 2</td>
                                    <td className="px-4 py-3 text-center">36</td>
                                    <td className="px-4 py-3"></td>
                                    <td className="px-4 py-3 text-center text-blue-700 text-sm">{totalProses2.toFixed(2)}</td>
                                    <td className="px-4 py-3"></td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>

                        {/* Page Indicator and Navigation */}
                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row border-t border-slate-100 pt-5">
                          <button
                            type="button"
                            onClick={() => setHsePlanStep(2)}
                            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                          >
                            &lt; Prev
                          </button>
                          
                          <div className="text-xs text-slate-400 font-semibold select-none">
                            &lt; 2/8 &gt;
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Semua Proses</span>
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-2 text-sm font-extrabold text-blue-700">
                              {(totalProses1 + totalProses2).toFixed(2)}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDocumentSubmit("HSE Plan")}
                            className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98]"
                          >
                            Next &gt;
                          </button>
                        </div>

                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ============================================== */}
              {/* DOCUMENT PATH B: PJA WORKFLOW (1 STEP) */}
              {/* ============================================== */}
              {activeDocumentType === "PJA" && (
                <div className="rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm">
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handleDocumentSubmit("PJA"); }} className="space-y-5" noValidate>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Create Pre-Job Assessment (PJA)</h3>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Judul Pekerjaan</label>
                        <input type="text" readOnly value={projectName} className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none cursor-not-allowed" />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="potensi-bahaya" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Identifikasi Potensi Bahaya</label>
                        <textarea id="potensi-bahaya" required rows={3} placeholder="Sebutkan potensi bahaya di lingkungan kerja..." value={potensiBahaya} onChange={(e) => setPotensiBahaya(e.target.value)} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
                        <div className="error-msg text-[10px] font-semibold text-red-600 mt-1">Potensi bahaya diperlukan.</div>
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="mitigasi" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Tindakan Pencegahan / Mitigasi</label>
                        <textarea id="mitigasi" required rows={3} placeholder="Masukkan rencana pencegahan risiko..." value={tindakanPencegahan} onChange={(e) => setTindakanPencegahan(e.target.value)} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
                        <div className="error-msg text-[10px] font-semibold text-red-600 mt-1">Rencana mitigasi diperlukan.</div>
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="apd" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Alat Pelindung Diri (APD) Wajib</label>
                        <input type="text" id="apd" required placeholder="Contoh: Safety Helmet, Harness, Vest..." value={apdDiperlukan} onChange={(e) => setApdDiperlukan(e.target.value)} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
                        <div className="error-msg text-[10px] font-semibold text-red-600 mt-1">APD wajib diperlukan.</div>
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="tgl-pja" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal Assessment PJA</label>
                        <input type="date" id="tgl-pja" required value={tanggalPJA} onChange={(e) => setTanggalPJA(e.target.value)} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
                        <div className="error-msg text-[10px] font-semibold text-red-600 mt-1">Tanggal assessment diperlukan.</div>
                      </div>
                    </form>

                    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-6">
                      <div className="space-y-4">
                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Document Preview (PJA)</span>
                        <div className="relative border border-slate-300 rounded-lg bg-white p-6 shadow-inner aspect-[3/4] overflow-hidden flex flex-col justify-between text-slate-800 text-[8px] leading-relaxed select-none">
                          <div className="flex items-center justify-between border-b border-blue-900 pb-2">
                            <div className="text-left font-bold text-blue-900 text-[10px]">PERTAMINA</div>
                            <div className="text-right text-[6px] text-slate-400">No. Dok: HSE-PJA-02</div>
                          </div>
                          <div className="text-center font-bold text-slate-900 uppercase my-3 space-y-1">
                            <p className="text-[9px]">PJA CHECKLIST REPORT</p>
                            <p className="text-[8px] text-blue-950">ANALISIS POTENSI BAHAYA DI WILAYAH OPERASIONAL</p>
                          </div>
                          <div className="flex-1 space-y-2 py-2 text-slate-600">
                            <p className="text-[7px]">Bahaya teridentifikasi: {potensiBahaya || "[Belum diisi]"}</p>
                            <p className="text-[7px]">Tindakan mitigasi: {tindakanPencegahan || "[Belum diisi]"}</p>
                            <p className="text-[7px]">APD Wajib: {apdDiperlukan || "[Belum diisi]"}</p>
                          </div>
                          <div className="flex justify-end pt-2">
                            <div className="text-right w-24">
                              <p className="font-bold text-slate-800">Evaluator</p>
                              <div className="h-6 w-full flex items-center justify-center my-0.5 border border-dashed border-slate-200 text-slate-300">Signature</div>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-700 font-bold text-xs shrink-0">PDF</span>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-900 truncate">Pre Job Assessment Form.pdf</p>
                              <p className="text-[10px] text-slate-400">2.4 MB</p>
                            </div>
                          </div>
                          <button type="button" onClick={() => alert("Simulating PDF full view...")} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50">View File</button>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-3 mt-6 border-t border-slate-200 pt-4">
                        <button type="button" onClick={() => { setCurrentView("overview"); setSelectedCategory("All"); }} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50">Cancel</button>
                        <button type="button" onClick={() => handleDocumentSubmit("PJA")} className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98]">Finish & Submit</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================== */}
              {/* DOCUMENT PATH C: WIP WORKFLOW (1 STEP) */}
              {/* ============================================== */}
              {activeDocumentType === "WIP" && (
                <div className="rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm">
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handleDocumentSubmit("WIP"); }} className="space-y-5" noValidate>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Create Work In Progress (WIP)</h3>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Judul Pekerjaan</label>
                        <input type="text" readOnly value={projectName} className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none cursor-not-allowed" />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="aktivitas" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Deskripsi Aktivitas Harian Lapangan</label>
                        <textarea id="aktivitas" required rows={4} placeholder="Jelaskan aktivitas pengerjaan fisik harian..." value={deskripsiAktivitas} onChange={(e) => setDeskripsiAktivitas(e.target.value)} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
                        <div className="error-msg text-[10px] font-semibold text-red-600 mt-1">Deskripsi aktivitas diperlukan.</div>
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="patrol" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Catatan Temuan Patrol Safety</label>
                        <input type="text" id="patrol" required placeholder="Masukkan temuan safety lapangan jika ada..." value={patrolSafety} onChange={(e) => setPatrolSafety(e.target.value)} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
                        <div className="error-msg text-[10px] font-semibold text-red-600 mt-1">Catatan patrol safety diperlukan.</div>
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="hours" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Total Jam Kerja Aman (Safe Man-Hours)</label>
                        <input type="number" id="hours" required min="0" placeholder="Masukkan akumulasi jam kerja aman..." value={safeManHours} onChange={(e) => setSafeManHours(e.target.value)} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
                        <div className="error-msg text-[10px] font-semibold text-red-600 mt-1">Jumlah jam kerja aman diperlukan.</div>
                      </div>
                    </form>

                    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-6">
                      <div className="space-y-4">
                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Document Preview (WIP)</span>
                        <div className="relative border border-slate-300 rounded-lg bg-white p-6 shadow-inner aspect-[3/4] overflow-hidden flex flex-col justify-between text-slate-800 text-[8px] leading-relaxed select-none">
                          <div className="flex items-center justify-between border-b border-blue-900 pb-2">
                            <div className="text-left font-bold text-blue-950 text-[10px]">PERTAMINA</div>
                            <div className="text-right text-[6px] text-slate-400">No. Dok: HSE-WIP-03</div>
                          </div>
                          <div className="text-center font-bold text-slate-900 uppercase my-3 space-y-1">
                            <p className="text-[9px]">LAPORAN PENGAWASAN LAPANGAN</p>
                            <p className="text-[8px] text-blue-950">WORK IN PROGRESS (WIP) AUDIT REPORT</p>
                          </div>
                          <div className="flex-1 space-y-2 py-2 text-slate-600">
                            <p className="text-[7px]">Aktivitas harian: {deskripsiAktivitas || "[Belum diisi]"}</p>
                            <p className="text-[7px]">Temuan Safety Patrol: {patrolSafety || "[Belum diisi]"}</p>
                            <p className="text-[7px]">Safe Man-Hours: {safeManHours || "0"}</p>
                          </div>
                          <div className="flex justify-end pt-2">
                            <div className="text-right w-24">
                              <p className="font-bold text-slate-800">Evaluator</p>
                              <div className="h-6 w-full flex items-center justify-center my-0.5 border border-dashed border-slate-200 text-slate-300">Signature</div>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-700 font-bold text-xs shrink-0">PDF</span>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-900 truncate">Work In Progress Audit Form.pdf</p>
                              <p className="text-[10px] text-slate-400">3.1 MB</p>
                            </div>
                          </div>
                          <button type="button" onClick={() => alert("Simulating PDF full view...")} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50">View File</button>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-3 mt-6 border-t border-slate-200 pt-4">
                        <button type="button" onClick={() => { setCurrentView("overview"); setSelectedCategory("All"); }} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50">Cancel</button>
                        <button type="button" onClick={() => handleDocumentSubmit("WIP")} className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98]">Finish & Submit</button>
                      </div>
                    </div>
                  </div>
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
                        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Create Final Evaluation (FE)</h3>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Judul Pekerjaan</label>
                        <input type="text" readOnly value={projectName} className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none cursor-not-allowed" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label htmlFor="temuan" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Total Temuan Audit</label>
                          <input type="number" id="temuan" required min="0" placeholder="0" value={totalTemuan} onChange={(e) => setTotalTemuan(e.target.value)} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
                          <div className="error-msg text-[10px] font-semibold text-red-600 mt-1">Jumlah temuan diperlukan.</div>
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="status-temuan" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Status Temuan Akhir</label>
                          <select id="status-temuan" value={statusTemuan} onChange={(e) => setStatusTemuan(e.target.value)} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10">
                            <option value="Closed">Closed / Diselesaikan</option>
                            <option value="Open">Open / Terbuka</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="score" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Skor Kinerja Akhir Kontraktor (HSE Score 1-100)</label>
                        <input type="number" id="score" required min="1" max="100" placeholder="Masukkan nilai evaluasi (e.g. 92)..." value={hseScore} onChange={(e) => setHseScore(e.target.value)} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
                        <div className="error-msg text-[10px] font-semibold text-red-600 mt-1">Skor kinerja HSE diperlukan.</div>
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="rekomendasi" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Rekomendasi Penutupan Kontrak</label>
                        <textarea id="rekomendasi" required rows={3} placeholder="Berikan catatan rekomendasi penutupan audit administrasi..." value={rekomendasiClose} onChange={(e) => setRekomendasiClose(e.target.value)} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
                        <div className="error-msg text-[10px] font-semibold text-red-600 mt-1">Rekomendasi diperlukan.</div>
                      </div>
                    </form>

                    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-6">
                      <div className="space-y-4">
                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Document Preview (FE)</span>
                        <div className="relative border border-slate-300 rounded-lg bg-white p-6 shadow-inner aspect-[3/4] overflow-hidden flex flex-col justify-between text-slate-800 text-[8px] leading-relaxed select-none">
                          <div className="flex items-center justify-between border-b border-blue-900 pb-2">
                            <div className="text-left font-bold text-blue-950 text-[10px]">PERTAMINA</div>
                            <div className="text-right text-[6px] text-slate-400">No. Dok: HSE-FE-04</div>
                          </div>
                          <div className="text-center font-bold text-slate-900 uppercase my-3 space-y-1">
                            <p className="text-[9px]">FINAL PERFORMANCE EVALUATION</p>
                            <p className="text-[8px] text-blue-950">SERTIFIKASI KINERJA KONTRAKTOR HSSE</p>
                          </div>
                          <div className="flex-1 space-y-2 py-2 text-slate-600">
                            <p className="text-[7px]">Temuan audit: {totalTemuan || "0"} ({statusTemuan}).</p>
                            <p className="text-[7px]">HSE Score: {hseScore || "0"} / 100.</p>
                            <p className="text-[7px]">Rekomendasi: {rekomendasiClose || "[Belum diisi]"}</p>
                          </div>
                          <div className="flex justify-end pt-2">
                            <div className="text-right w-24">
                              <p className="font-bold text-slate-800">Evaluator</p>
                              <div className="h-6 w-full flex items-center justify-center my-0.5 border border-dashed border-slate-200 text-slate-300">Signature</div>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-700 font-bold text-xs shrink-0">PDF</span>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-900 truncate">Final Evaluation Form.pdf</p>
                              <p className="text-[10px] text-slate-400">1.2 MB</p>
                            </div>
                          </div>
                          <button type="button" onClick={() => alert("Simulating PDF full view...")} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50">View File</button>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-3 mt-6 border-t border-slate-200 pt-4">
                        <button type="button" onClick={() => { setCurrentView("overview"); setSelectedCategory("All"); }} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50">Cancel</button>
                        <button type="button" onClick={() => handleDocumentSubmit("FE")} className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98]">Finish & Submit</button>
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
