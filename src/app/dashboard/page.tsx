"use client";

import React, { useState, useMemo, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { DocumentItem, getDocuments, addDocument, uploadDocumentFile, insertDocumentRecord, openDocument } from "../../utils/documentStore";
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

  // Predictor form states
  const [hseScoreInput, setHseScoreInput] = useState(80);
  const [pjaScoreInput, setPjaScoreInput] = useState(75);
  const [wipScoreInput, setWipScoreInput] = useState(70);
  const [feScoreInput, setFeScoreInput] = useState(85);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [predictError, setPredictError] = useState<string | null>(null);

  const handlePredict = () => {
    setIsPredicting(true);
    setPredictionResult(null);
    setPredictError(null);

    // Simulate ML model latency / tree building animation
    setTimeout(() => {
      try {
        const hse = hseScoreInput;
        const pja = pjaScoreInput;
        const wip = wipScoreInput;
        const fe = feScoreInput;

        // Simple Random Forest classifier mockup (deterministic client-side ensemble)
        const votes = [
          // Tree 1: Focuses on FE & WIP
          fe >= 80 ? (wip >= 70 ? "High" : "Medium") : (fe >= 60 ? "Medium" : "Low"),
          // Tree 2: Focuses on HSE & PJA
          pja >= 80 ? (hse >= 75 ? "High" : "Medium") : (pja >= 60 ? "Medium" : "Low"),
          // Tree 3: Focuses on PJA & WIP
          wip >= 75 ? (pja >= 70 ? "High" : "Medium") : (wip >= 55 ? "Medium" : "Low"),
          // Tree 4: Focuses on FE & HSE
          fe >= 85 ? (hse >= 70 ? "High" : "Medium") : (fe >= 60 ? "Medium" : "Low"),
          // Tree 5: Focuses on WIP & FE
          hse >= 80 ? (wip >= 75 ? "High" : "Medium") : (hse >= 60 ? "Medium" : "Low"),
        ];

        const counts = { High: 0, Medium: 0, Low: 0 };
        votes.forEach((v) => {
          counts[v as "High" | "Medium" | "Low"]++;
        });

        // Determine majority winner
        let winnerClass = "Medium Performance";
        let maxVotes = 0;
        Object.entries(counts).forEach(([k, v]) => {
          if (v > maxVotes) {
            maxVotes = v;
            winnerClass = k === "High" ? "High Performance" : k === "Medium" ? "Medium Performance" : "Low Performance";
          }
        });

        // Calculate overall score (weighted)
        const overallScore = Math.round((hse * 0.15) + (pja * 0.25) + (wip * 0.3) + (fe * 0.3));

        setPredictionResult({
          winner: winnerClass,
          score: overallScore,
          votes,
          counts,
          details: [
            `Tree 1 (FE/WIP Split) Voted: ${votes[0]}`,
            `Tree 2 (HSE/PJA Split) Voted: ${votes[1]}`,
            `Tree 3 (PJA/WIP Split) Voted: ${votes[2]}`,
            `Tree 4 (FE/HSE Split) Voted: ${votes[3]}`,
            `Tree 5 (HSE/WIP Split) Voted: ${votes[4]}`,
          ]
        });
      } catch (err) {
        setPredictError("Failed to calculate prediction.");
      } finally {
        setIsPredicting(false);
      }
    }, 1200);
  };

  const handleResetPredictor = () => {
    setHseScoreInput(80);
    setPjaScoreInput(75);
    setWipScoreInput(70);
    setFeScoreInput(85);
    setPredictionResult(null);
    setPredictError(null);
  };

  const [currentUser, setCurrentUser] = useState({
    email: "",
    role: "User" as any,
    fullName: "",
  });

  // Form/upload states for the upload document modal
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState<"HSE Plan" | "PJA" | "WIP" | "FE">("HSE Plan");
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
    visible: boolean;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (type: "success" | "error", title: string, message: string) => {
    setToast({ type, title, message, visible: true });
    setTimeout(() => setToast(null), 4000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setSelectedFileName(e.target.files[0].name);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile || !selectedFileName) {
      showToast("error", "Unggah Gagal", "Silakan pilih file terlebih dahulu.");
      return;
    }

    setIsUploading(true);

    try {
      const formattedDate = new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const formattedTime = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const uploadResult = await uploadDocumentFile(selectedFile);
      if (!uploadResult) {
        const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "documents";
        showToast(
          "error",
          "Unggah Gagal",
          `Masalah penyimpanan dokumen. Pastikan bucket Supabase '${bucketName}' ada dan coba lagi.`
        );
        setIsUploadDocModalOpen(false);
        setSelectedFileName(null);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      const insertRes = await insertDocumentRecord({
        nama: uploadTitle,
        added: formattedDate.replace(/ /g, "-"),
        addedDate: new Date().toISOString(),
        status: "New",
        type: uploadType,
        fileName: selectedFileName || undefined,
        filePath: uploadResult.filePath || undefined,
      });

      if (!insertRes.success) {
        // fallback to local storage for UX, but notify user about DB failure
        await addDocument({
          nama: uploadTitle,
          added: formattedDate.replace(/ /g, "-"),
          addedDate: new Date().toISOString(),
          status: "New",
          type: uploadType,
          fileName: selectedFileName,
          filePath: uploadResult.filePath,
        });
        console.error("Failed to insert document into Supabase:", insertRes, JSON.stringify(insertRes.error, null, 2));
        const errText = typeof insertRes.error === "string" ? insertRes.error : JSON.stringify(insertRes.error);
        showToast("error", "Unggah Tersimpan (Local)", `Dokumen disimpan lokal. DB error: ${errText}`);
      }

      // Refresh documents
      const docs = await getDocuments();
      setDocuments(docs);

      setIsUploadDocModalOpen(false);
      setSelectedFileName(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      showToast("success", "Unggah Berhasil", `Dokumen "${selectedFileName}" berhasil diunggah.`);
    } catch (error) {
      console.error("Upload error:", error);
      showToast("error", "Unggah Gagal", "Terjadi kesalahan saat mengunggah dokumen. Silakan coba lagi.");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    const handleSessionChange = () => {
      const user = getCurrentUser();
      if (user) {
        setCurrentUser(user);
      }
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
                    className="w-full rounded-xl border border-slate-200 py-2.5 text-center text-xs font-semibold text-slate-655 transition-colors hover:bg-slate-55 active:scale-[0.99] cursor-pointer"
                  >
                    View Full Audit Logs
                  </button>
                </div>
              </section>

              {/* CONTRACTOR PERFORMANCE PREDICTOR (RANDOM FOREST ML) */}
              <section className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-905">Contractor Performance Predictor</h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-semibold leading-relaxed">
                    Predict contractor safety category using client-side Random Forest Classifier (Ensemble Voting Method)
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Form Sliders */}
                  <div className="lg:col-span-5 space-y-5">
                    <div className="space-y-4">
                      {/* HSE Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                          <label htmlFor="hse-slider">1. HSE Plan Score</label>
                          <span className="bg-red-50 border border-red-100 text-red-700 font-extrabold px-2.5 py-0.5 rounded-md text-[10px]">
                            {hseScoreInput} / 100
                          </span>
                        </div>
                        <input
                          id="hse-slider"
                          type="range"
                          min="0"
                          max="100"
                          value={hseScoreInput}
                          onChange={(e) => setHseScoreInput(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-red-500"
                        />
                      </div>

                      {/* PJA Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                          <label htmlFor="pja-slider">2. Pre-Job Assessment (PJA) Score</label>
                          <span className="bg-blue-50 border border-blue-100 text-blue-700 font-extrabold px-2.5 py-0.5 rounded-md text-[10px]">
                            {pjaScoreInput} / 100
                          </span>
                        </div>
                        <input
                          id="pja-slider"
                          type="range"
                          min="0"
                          max="100"
                          value={pjaScoreInput}
                          onChange={(e) => setPjaScoreInput(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                      </div>

                      {/* WIP Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                          <label htmlFor="wip-slider">3. Work In Progress (WIP) Score</label>
                          <span className="bg-amber-50 border border-amber-100 text-amber-700 font-extrabold px-2.5 py-0.5 rounded-md text-[10px]">
                            {wipScoreInput} / 100
                          </span>
                        </div>
                        <input
                          id="wip-slider"
                          type="range"
                          min="0"
                          max="100"
                          value={wipScoreInput}
                          onChange={(e) => setWipScoreInput(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>

                      {/* FE Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                          <label htmlFor="fe-slider">4. Final Evaluation (FE) Score</label>
                          <span className="bg-green-50 border border-green-100 text-green-700 font-extrabold px-2.5 py-0.5 rounded-md text-[10px]">
                            {feScoreInput} / 100
                          </span>
                        </div>
                        <input
                          id="fe-slider"
                          type="range"
                          min="0"
                          max="100"
                          value={feScoreInput}
                          onChange={(e) => setFeScoreInput(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handlePredict}
                        disabled={isPredicting}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 text-white py-2.5 text-xs font-bold hover:bg-indigo-700 active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-indigo-500/15 disabled:opacity-50"
                      >
                        {isPredicting ? (
                          <>
                            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            Predict Performance
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleResetPredictor}
                        disabled={isPredicting}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-55 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Prediction Output */}
                  <div className="lg:col-span-7 border border-slate-105 rounded-2xl bg-slate-50/50 p-6 flex flex-col justify-center min-h-[250px] text-center relative overflow-hidden">
                    {isPredicting ? (
                      <div className="space-y-3 flex flex-col items-center justify-center">
                        <div className="relative flex items-center justify-center">
                          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                          <svg className="absolute h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m0 0l-2-1m2 1v2.5M14 4l-2-1m0 0L8 4m4-1v2.5M4 7L2 8m0 0l2 1m-2-1v2.5M7 10L5 11m0 0l2 1m-2-1v2.5M20 13l-2 1m0 0l-2-1m2 1v2.5" />
                          </svg>
                        </div>
                        <p className="text-xs font-bold text-slate-800">Random Forest Classifier Running...</p>
                        <div className="space-y-1 max-w-xs text-[10px] text-slate-400 font-semibold leading-normal">
                          <p className="animate-pulse">Growing 5 decision trees...</p>
                          <p className="opacity-75">Bootstrapping evaluation sub-features...</p>
                          <p className="opacity-50">Aggregating ensemble votes...</p>
                        </div>
                      </div>
                    ) : predictionResult ? (
                      <div className="space-y-5 text-left h-full flex flex-col justify-between">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/50 pb-4">
                          <div>
                            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Classification Output</span>
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black border mt-1.5 ${
                              predictionResult.winner === "High Performance"
                                ? "bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm shadow-emerald-500/10"
                                : predictionResult.winner === "Medium Performance"
                                ? "bg-amber-50 border-amber-100 text-amber-700 shadow-sm shadow-amber-500/10"
                                : "bg-rose-50 border-rose-100 text-rose-700 shadow-sm shadow-rose-500/10"
                            }`}>
                              {predictionResult.winner}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Overall Metric Score</span>
                              <span className="text-2xl font-black text-slate-800">{predictionResult.score} <span className="text-xs font-bold text-slate-400">/ 100</span></span>
                            </div>
                          </div>
                        </div>

                        {/* Vote distributions */}
                        <div className="space-y-3">
                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Ensemble Vote Distribution (5 Trees)</span>
                          <div className="grid grid-cols-3 gap-2">
                            {/* High Class */}
                            <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
                              <span className="block text-[9px] font-bold text-slate-400 uppercase">High Class</span>
                              <span className="text-lg font-black text-emerald-600 mt-1 block">{predictionResult.counts.High} <span className="text-[10px] text-slate-400 font-bold">votes</span></span>
                              <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${(predictionResult.counts.High / 5) * 100}%` }} />
                              </div>
                            </div>
                            {/* Medium Class */}
                            <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
                              <span className="block text-[9px] font-bold text-slate-400 uppercase">Medium Class</span>
                              <span className="text-lg font-black text-amber-600 mt-1 block">{predictionResult.counts.Medium} <span className="text-[10px] text-slate-400 font-bold">votes</span></span>
                              <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500" style={{ width: `${(predictionResult.counts.Medium / 5) * 100}%` }} />
                              </div>
                            </div>
                            {/* Low Class */}
                            <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
                              <span className="block text-[9px] font-bold text-slate-400 uppercase">Low Class</span>
                              <span className="text-lg font-black text-rose-600 mt-1 block">{predictionResult.counts.Low} <span className="text-[10px] text-slate-400 font-bold">votes</span></span>
                              <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-rose-500" style={{ width: `${(predictionResult.counts.Low / 5) * 100}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Model Diagnostics tree votes logs */}
                        <div className="bg-white border border-slate-105 rounded-xl p-3.5 space-y-1.5">
                          <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Ensemble Diagnostics</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                            {predictionResult.details.map((detail: string, idx: number) => (
                              <div key={idx} className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                                {detail}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 py-8 flex flex-col items-center justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-2">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 113.536 0V21h2v-2.757a5 5 0 013.536 0M12 7a5 5 0 010 10V7z" />
                          </svg>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800">Model Not Evaluated Yet</h4>
                        <p className="text-[10px] text-slate-400 font-semibold max-w-sm leading-normal">
                          Adjust the CSMS score sliders on the left and click &quot;Predict Performance&quot; to execute the Random Forest classifier.
                        </p>
                      </div>
                    )}
                  </div>
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

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-4">
                  <div className="flex flex-wrap gap-2">
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

                  {/* Upload button for Procurement or Admin */}
                  {(currentUser.role === "Procurement" || currentUser.role === "Admin") && (
                    <button
                      onClick={() => {
                        setUploadTitle("");
                        setIsUploadDocModalOpen(true);
                      }}
                      className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all cursor-pointer shadow-sm hover:shadow active:scale-[0.98] self-start sm:self-auto"
                    >
                      <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Upload Dokumen
                    </button>
                  )}
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
                              {doc.filePath ? (
                                <button
                                  type="button"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    const url = await openDocument(doc.filePath as string);
                                    if (url) {
                                      window.open(url, "_blank");
                                    } else {
                                      showToast("error", "Buka Gagal", "File tidak tersedia untuk dibuka.");
                                    }
                                  }}
                                  className="text-left text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1.5"
                                >
                                  <svg className="h-4 w-4 shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  {doc.nama}
                                </button>
                              ) : (
                                doc.nama
                              )}
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

      {/* TOAST NOTIFICATION */}
      {toast && toast.visible && (
        <div className="fixed right-6 top-6 z-50 w-[320px] rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-[0_20px_70px_-35px_rgba(0,0,0,0.35)] backdrop-blur-sm text-slate-900">
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl ${toast.type === "success" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
              {toast.type === "success" ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">{toast.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{toast.message}</p>
                </div>
                <button
                  onClick={() => setToast(null)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <span className="sr-only">Close notification</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPLOADING LOADER */}
      {isUploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm px-4 text-slate-900">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white/95 p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
              <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            </div>
            <p className="mt-4 text-sm font-bold text-slate-900">Mengunggah dokumen...</p>
            <p className="mt-2 text-xs text-slate-500">Mohon tunggu, proses upload sedang berlangsung.</p>
          </div>
        </div>
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      {isUploadDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in text-slate-900">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-800">Unggah Dokumen Baru</h3>
                <p className="text-[11px] text-slate-455 mt-0.5 font-medium">Pilih pengadaan dan berkas dokumen yang ingin Anda unggah.</p>
              </div>
              <button
                onClick={() => {
                  setIsUploadDocModalOpen(false);
                  setSelectedFileName(null);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleUploadSubmit}>
              <div className="p-6 space-y-4 text-left">
                {/* Judul Pengadaan Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 select-none">
                    Judul Pengadaan
                  </label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    required
                    placeholder="Masukkan judul pengadaan..."
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-medium text-slate-700 bg-white transition-all focus:bg-white"
                  />
                </div>

                {/* Jenis Dokumen Field */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 select-none">
                    Jenis Dokumen
                  </label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as "HSE Plan" | "PJA" | "WIP" | "FE")}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-medium text-slate-700 bg-white transition-all cursor-pointer"
                  >
                    <option value="HSE Plan">HSE Plan</option>
                    <option value="PJA">Pre Job Assessment (PJA)</option>
                    <option value="WIP">Work In Progress (WIP)</option>
                    <option value="FE">Final Evaluation (FE)</option>
                  </select>
                </div>

                {/* File Dropzone Area */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-600 select-none">
                    File Dokumen (PDF)
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    id="doc-file-input"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-250 hover:border-indigo-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-all select-none group"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 group-hover:scale-105 transition-transform">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    {selectedFileName ? (
                      <div className="text-center space-y-1">
                        <p className="text-xs font-bold text-slate-800 break-all px-4">
                          {selectedFileName}
                        </p>
                        <p className="text-[10px] text-emerald-600 font-semibold flex items-center justify-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          File terpilih
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-xs font-bold text-slate-700">
                          Klik untuk menelusuri file
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                          Mendukung berkas PDF, DOC, atau DOCX maks 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadDocModalOpen(false);
                    setSelectedFileName(null);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 text-white px-6 py-2 text-xs font-bold hover:bg-indigo-700 active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-indigo-500/15"
                >
                  Unggah Dokumen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
