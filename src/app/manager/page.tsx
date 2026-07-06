"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { uploadDocumentFile, addDocument, insertDocumentRecord, openDocument, getDocuments } from "../../utils/documentStore";

export default function ManagerDashboard() {
  const [selectedProcurement, setSelectedProcurement] = useState(
    "Pengadaan Time Charter 1 (one) Unit VLGC Laycan 19-20 Februari 2024 (LPGC SC Commander LVII)"
  );
  
  // Category filter state: null means no filter (show all)
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  
  // Modal visibility states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadsModalOpen, setIsUploadsModalOpen] = useState(false);
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);

  // Form states for the upload document modal
  const [uploadTitle, setUploadTitle] = useState(selectedProcurement);
  const [uploadType, setUploadType] = useState<"HSE Plan" | "PJA" | "WIP" | "FE">("HSE Plan");
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
    visible: boolean;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulated procurements for sidebar and tables
  const sidebarProcurements = [
    "Pengadaan Time Charter 1 (one) Unit VLGC Laycan 19-20 Februari 2024 (LPGC SC Commander LVII)",
    "Pengadaan COA 1 (satu) Unit Small LPG Carrier",
    "LPGC Jenggala",
    "Pengadaan Time Charter 1 (one) Unit VLGC Laycan 15-16 Maret 2024",
    "Pengadaan Time Charter 1 (one) Unit VLGC Laycan 10-11 April 2024",
    "Pengadaan Time Charter 1 (one) Unit VLGC Laycan 05-06 Mei 2024",
    "Pengadaan Time Charter 1 (one) Unit VLGC Laycan 22-23 Juni 2024",
  ];

  const procurementsTable = [
    {
      id: 1,
      title:
        "Pengadaan Time Charter 1 (one) Unit VLGC Laycan 19-20 Feb 2024 (LPGC SC Commander LVII)",
      type: "HSE Plan",
      status: "On Review by PIC",
      statusColor: "bg-amber-50 border-amber-100 text-amber-700",
      progress: 60,
      progressColor: "bg-amber-500",
      date: "22 Feb 2026",
    },
    {
      id: 2,
      title: "Pengadaan COA 1 (satu) Unit Small LPG Carrier",
      type: "WIP",
      status: "Draft",
      statusColor: "bg-slate-50 border-slate-200 text-slate-500",
      progress: 0,
      progressColor: "bg-slate-300",
      date: "10 Feb 2026",
    },
    {
      id: 3,
      title: "LPGC Jenggala",
      type: "PJA",
      status: "Approved",
      statusColor: "bg-emerald-50 border-emerald-100 text-emerald-700",
      progress: 100,
      progressColor: "bg-emerald-500",
      date: "05 Feb 2026",
    },
    {
      id: 4,
      title: "Pengadaan Time Charter 1 (one) Unit VLGC Laycan 15-16 Mar 2024",
      type: "HSE Plan",
      status: "Need Revision",
      statusColor: "bg-rose-50 border-rose-100 text-rose-600",
      progress: 30,
      progressColor: "bg-rose-500",
      date: "01 Feb 2026",
    },
    {
      id: 5,
      title: "Pengadaan Time Charter 1 (one) Unit VLGC Laycan 10-11 Apr 2024",
      type: "FE",
      status: "Draft",
      statusColor: "bg-slate-50 border-slate-200 text-slate-500",
      progress: 0,
      progressColor: "bg-slate-300",
      date: "28 Jan 2026",
    },
    {
      id: 6,
      title: "Pengadaan Time Charter 1 (one) Unit VLGC Laycan 05-06 Mei 2024",
      type: "PJA",
      status: "Approved",
      statusColor: "bg-emerald-50 border-emerald-100 text-emerald-700",
      progress: 100,
      progressColor: "bg-emerald-500",
      date: "15 Jan 2026",
    },
    {
      id: 7,
      title: "Pengadaan Time Charter 1 (one) Unit VLGC Laycan 22-23 Juni 2024",
      type: "FE",
      status: "On Review by PIC",
      statusColor: "bg-amber-50 border-amber-100 text-amber-700",
      progress: 45,
      progressColor: "bg-amber-500",
      date: "10 Jan 2026",
    },
  ];

  // In-memory state for uploaded documents
  const [uploadedDocs, setUploadedDocs] = useState<{
    id: number;
    type: string;
    fileName: string;
    date: string;
    status: string;
    statusColor: string;
    filePath?: string;
  }[]>([
    {
      id: 1,
      type: "HSE Plan",
      fileName: "HSE_Plan_TimeCharter1.pdf",
      date: "20 Feb 2026 10:30",
      status: "On Review",
      statusColor: "bg-amber-50 border-amber-100 text-amber-700",
    },
    {
      id: 2,
      type: "PJA",
      fileName: "PJA_TimeCharter1.pdf",
      date: "20 Feb 2026 10:28",
      status: "On Review",
      statusColor: "bg-amber-50 border-amber-100 text-amber-700",
    },
    {
      id: 3,
      type: "WIP",
      fileName: "WIP_Report_Q1_Pertamina.pdf",
      date: "18 Feb 2026 14:15",
      status: "Approved",
      statusColor: "bg-emerald-50 border-emerald-100 text-emerald-700",
    },
    {
      id: 4,
      type: "FE",
      fileName: "FE_Evaluation_Final_SC_Commander.pdf",
      date: "15 Feb 2026 16:45",
      status: "Approved",
      statusColor: "bg-emerald-50 border-emerald-100 text-emerald-700",
    },
    {
      id: 5,
      type: "HSE Plan",
      fileName: "HSE_Plan_GasLaura_Revised.pdf",
      date: "12 Feb 2026 11:20",
      status: "Need Revision",
      statusColor: "bg-rose-50 border-rose-100 text-rose-600",
    },
    {
      id: 6,
      type: "PJA",
      fileName: "PJA_Checklist_GasArtemis.pdf",
      date: "10 Feb 2026 09:10",
      status: "Approved",
      statusColor: "bg-emerald-50 border-emerald-100 text-emerald-700",
    },
  ]);

  const recentUploads = uploadedDocs.slice(0, 2);

  const loadDBDocuments = async () => {
    try {
      const docs = await getDocuments();
      const dbUploaded = docs
        .filter((doc) => doc.fileName || doc.filePath)
        .map((doc) => {
          const getStatusColor = (status: string) => {
            switch (status) {
              case "On Review":
              case "On Review by PIC":
                return "bg-amber-50 border-amber-100 text-amber-700";
              case "Draft":
                return "bg-slate-50 border-slate-200 text-slate-500";
              case "Approved":
              case "Done":
                return "bg-emerald-50 border-emerald-100 text-emerald-700";
              case "Need Revision":
                return "bg-rose-50 border-rose-100 text-rose-600";
              case "New":
                return "bg-red-50 border-red-100 text-red-600";
              case "On Progress":
                return "bg-blue-50 border-blue-100 text-blue-600";
              default:
                return "bg-slate-50 border-slate-200 text-slate-500";
            }
          };

          const formattedDate = (() => {
            if (!doc.addedDate) return doc.added;
            try {
              const dateObj = new Date(doc.addedDate);
              const timeStr = dateObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
              return `${doc.added} ${timeStr}`;
            } catch (e) {
              return doc.added;
            }
          })();

          return {
            id: doc.no,
            type: doc.type,
            fileName: doc.fileName || `${doc.type}_${doc.no}.pdf`,
            date: formattedDate,
            status: doc.status,
            statusColor: getStatusColor(doc.status),
            filePath: doc.filePath,
          };
        });

      setUploadedDocs((prev) => {
        const defaultItems: {
          id: number;
          type: string;
          fileName: string;
          date: string;
          status: string;
          statusColor: string;
          filePath?: string;
        }[] = [
          {
            id: 1,
            type: "HSE Plan",
            fileName: "HSE_Plan_TimeCharter1.pdf",
            date: "20 Feb 2026 10:30",
            status: "On Review",
            statusColor: "bg-amber-50 border-amber-100 text-amber-700",
          },
          {
            id: 2,
            type: "PJA",
            fileName: "PJA_TimeCharter1.pdf",
            date: "20 Feb 2026 10:28",
            status: "On Review",
            statusColor: "bg-amber-50 border-amber-100 text-amber-700",
          },
          {
            id: 3,
            type: "WIP",
            fileName: "WIP_Report_Q1_Pertamina.pdf",
            date: "18 Feb 2026 14:15",
            status: "Approved",
            statusColor: "bg-emerald-50 border-emerald-100 text-emerald-700",
          },
          {
            id: 4,
            type: "FE",
            fileName: "FE_Evaluation_Final_SC_Commander.pdf",
            date: "15 Feb 2026 16:45",
            status: "Approved",
            statusColor: "bg-emerald-50 border-emerald-100 text-emerald-700",
          },
          {
            id: 5,
            type: "HSE Plan",
            fileName: "HSE_Plan_GasLaura_Revised.pdf",
            date: "12 Feb 2026 11:20",
            status: "Need Revision",
            statusColor: "bg-rose-50 border-rose-100 text-rose-600",
          },
          {
            id: 6,
            type: "PJA",
            fileName: "PJA_Checklist_GasArtemis.pdf",
            date: "10 Feb 2026 09:10",
            status: "Approved",
            statusColor: "bg-emerald-50 border-emerald-100 text-emerald-700",
          },
        ];
        const uniqueDefault = defaultItems.filter(
          (d) => !dbUploaded.some((dbDoc) => dbDoc.fileName === d.fileName || dbDoc.filePath === d.filePath)
        );
        return [...dbUploaded, ...uniqueDefault];
      });
    } catch (err) {
      console.error("Failed to load documents from database:", err);
    }
  };

  useEffect(() => {
    loadDBDocuments();
  }, []);

  // Helper to dynamically get timeline progress and comments based on the selected procurement status
  const getTimelineAndComment = (status: string, lastUpdateDate: string) => {
    switch (status) {
      case "On Review by PIC":
        return {
          comment: "Dokumen sedang ditinjau oleh PIC. Mohon menunggu proses review.",
          commentMeta: `PIC HSSE • ${lastUpdateDate} 09:15 WIB`,
          steps: [
            { title: "Submitted", desc: "Dokumen berhasil dikirim", date: "20 Feb 2026 10:30 WIB", status: "completed" },
            { title: "Under Review by PIC", desc: "Dokumen sedang dalam proses penilaian oleh PIC", date: `${lastUpdateDate} 09:15 WIB`, status: "active" },
            { title: "Need Revision", desc: "Dokumen perlu diperbaiki sesuai catatan", date: "-", status: "pending" },
            { title: "Approved", desc: "Dokumen disetujui", date: "-", status: "pending" },
          ]
        };
      case "Approved":
        return {
          comment: "Seluruh kriteria penilaian HSSE telah terpenuhi. Pengadaan disetujui.",
          commentMeta: `Manajer HSSE • ${lastUpdateDate} 14:20 WIB`,
          steps: [
            { title: "Submitted", desc: "Dokumen berhasil dikirim", date: "02 Feb 2026 09:00 WIB", status: "completed" },
            { title: "Under Review by PIC", desc: "Dokumen sedang dalam proses penilaian oleh PIC", date: "04 Feb 2026 11:30 WIB", status: "completed" },
            { title: "Need Revision", desc: "Dokumen perlu diperbaiki sesuai catatan", date: "Tidak ada temuan", status: "completed" },
            { title: "Approved", desc: "Dokumen disetujui", date: `${lastUpdateDate} 14:20 WIB`, status: "completed" },
          ]
        };
      case "Need Revision":
        return {
          comment: "Catatan PJA belum lengkap pada lampiran checklist. Harap lengkapi berkas.",
          commentMeta: `PIC HSSE • ${lastUpdateDate} 16:30 WIB`,
          steps: [
            { title: "Submitted", desc: "Dokumen berhasil dikirim", date: "28 Jan 2026 14:00 WIB", status: "completed" },
            { title: "Under Review by PIC", desc: "Dokumen sedang dalam proses penilaian oleh PIC", date: "30 Jan 2026 10:00 WIB", status: "completed" },
            { title: "Need Revision", desc: "Dokumen perlu diperbaiki sesuai catatan", date: `${lastUpdateDate} 16:30 WIB`, status: "active" },
            { title: "Approved", desc: "Dokumen disetujui", date: "-", status: "pending" },
          ]
        };
      case "Draft":
      default:
        return {
          comment: "Pengadaan baru saja dibuat. Dokumen pendukung belum diunggah.",
          commentMeta: `Sistem • ${lastUpdateDate} 08:00 WIB`,
          steps: [
            { title: "Submitted", desc: "Dokumen berhasil dikirim", date: "-", status: "pending" },
            { title: "Under Review by PIC", desc: "Dokumen sedang dalam proses penilaian oleh PIC", date: "-", status: "pending" },
            { title: "Need Revision", desc: "Dokumen perlu diperbaiki sesuai catatan", date: "-", status: "pending" },
            { title: "Approved", desc: "Dokumen disetujui", date: "-", status: "pending" },
          ]
        };
    }
  };

  // Find currently selected procurement data
  const currentProcurement =
    procurementsTable.find((item) => item.title === selectedProcurement) ||
    procurementsTable[0];

  const { comment, commentMeta, steps: timelineSteps } = getTimelineAndComment(
    currentProcurement.status,
    currentProcurement.date
  );

  // Filtering logic for the main table
  const filteredProcurements = selectedFilter
    ? procurementsTable.filter((item) => item.type === selectedFilter)
    : procurementsTable;

  // Dynamically calculate Ringkasan Progress counts based on active category filter
  const onReviewCount = filteredProcurements.filter((item) => item.status === "On Review by PIC").length;
  const approvedCount = filteredProcurements.filter((item) => item.status === "Approved").length;
  const needRevisionCount = filteredProcurements.filter((item) => item.status === "Need Revision").length;
  const draftCount = filteredProcurements.filter((item) => item.status === "Draft").length;

  const toggleFilter = (filterType: string) => {
    if (selectedFilter === filterType) {
      setSelectedFilter(null); // click again to clear filter
    } else {
      setSelectedFilter(filterType);
    }
  };

  const showToast = (type: "success" | "error", title: string, message: string) => {
    setToast({ type, title, message, visible: true });
    setTimeout(() => setToast(null), 4000);
  };

  // Handle native file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setSelectedFileName(e.target.files[0].name);
    }
  };

  // Handle file upload simulation
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

      const newDoc = {
        id: Date.now(),
        type: uploadType,
        fileName: selectedFileName,
        filePath: uploadResult.filePath,
        date: `${formattedDate} ${formattedTime}`,
        status: "On Review",
        statusColor: "bg-amber-50 border-amber-100 text-amber-700",
      };

      const insertRes = await insertDocumentRecord({
        nama: uploadTitle,
        added: formattedDate.replace(/ /g, "-"),
        addedDate: new Date().toISOString(),
        status: "On Review",
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
          status: "On Review",
          type: uploadType,
          fileName: selectedFileName,
          filePath: uploadResult.filePath,
        });
        console.error("Failed to insert document into Supabase:", insertRes, JSON.stringify(insertRes.error, null, 2));
        const errText = typeof insertRes.error === "string" ? insertRes.error : JSON.stringify(insertRes.error);
        showToast("error", "Unggah Tersimpan (Local)", `Dokumen disimpan lokal. DB error: ${errText}`);
      }

      await loadDBDocuments();
      setSelectedProcurement(uploadTitle);
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

  return (
    <>
      {/* 1. LEFT SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-20 flex w-72 flex-col border-r border-slate-200/80 bg-[#e9ecfa] p-4 select-none">
        {/* Navigation list */}
        <div className="flex flex-1 flex-col overflow-y-auto px-1 py-2 space-y-6">
          {/* Main Top Nav */}
          <div className="space-y-1.5">
            <button
              onClick={() => setSelectedFilter(null)}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold transition-all text-left border ${
                selectedFilter === null
                  ? "bg-white text-indigo-700 shadow-sm border-indigo-50"
                  : "border-transparent text-slate-600 hover:bg-white/60 hover:text-slate-800"
              }`}
            >
              <svg className={`h-5 w-5 ${selectedFilter === null ? "text-indigo-600" : "text-slate-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Home
            </button>
            <button
              onClick={() => {
                setUploadTitle(selectedProcurement);
                setIsUploadDocModalOpen(true);
              }}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-white/60 hover:text-slate-800 transition-all text-left border border-transparent cursor-pointer"
            >
              <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Upload Dokumen
            </button>
            <button
              onClick={() => alert("Progress Penilaian clicked")}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-white/60 hover:text-slate-800 transition-all text-left border border-transparent"
            >
              <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Progress Penilaian
            </button>
          </div>

          {/* Documents Section with filters */}
          <div className="space-y-1.5">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Documents
            </p>
            {[
              { name: "HSE Plan", abbr: "HSE Plan" },
              { name: "PJA", abbr: "PJA" },
              { name: "WIP", abbr: "WIP" },
              { name: "FE", abbr: "FE" },
            ].map((cat) => {
              const isActive = selectedFilter === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => toggleFilter(cat.name)}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold transition-all text-left border ${
                    isActive
                      ? "bg-white text-indigo-700 shadow-sm border-indigo-50"
                      : "border-transparent text-slate-600 hover:bg-white/60 hover:text-slate-800"
                  }`}
                >
                  <svg className={`h-5 w-5 ${isActive ? "text-indigo-600" : "text-slate-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  {cat.abbr}
                </button>
              );
            })}
          </div>

          {/* Pengadaan Saya Section */}
          <div className="space-y-1.5">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Pengadaan Saya
            </p>
            <div className="space-y-2 pr-1 max-h-72 overflow-y-auto">
              {sidebarProcurements.map((proc, index) => {
                const isSelected = selectedProcurement === proc;
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedProcurement(proc)}
                    className={`w-full block text-left truncate text-[11px] rounded-xl px-3.5 py-2.5 transition-all font-semibold leading-relaxed border ${
                      isSelected
                        ? "border-violet-400 bg-white text-violet-850 shadow-sm"
                        : "border-transparent bg-white/40 text-slate-600 hover:bg-white/60 hover:text-slate-855"
                    }`}
                    title={proc}
                  >
                    {proc}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Profile Footer */}
        <div className="border-t border-slate-200/60 pt-4 mt-auto">
          <div className="flex items-center gap-3 px-1">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 border border-violet-200 font-extrabold text-xs shadow-sm">
              PS
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-800">
                PUTRI FATIMA SUNNIA
              </p>
              <p className="truncate text-[10px] text-slate-450 font-semibold mt-0.5">
                putri.fatima@pertamina.com
              </p>
            </div>
          </div>
          <div className="mt-2 text-[9px] font-bold text-slate-400 px-1">
            Environmental & HSSE Governance
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex flex-1 flex-col pl-72">
        {toast && toast.visible && (
          <div className="fixed right-6 top-6 z-50 w-[320px] rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-[0_20px_70px_-35px_rgba(0,0,0,0.35)] backdrop-blur-sm">
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
        {isUploading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm px-4">
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
        {/* Banner with Safety Helmet and User profile overlay */}
        <div className="relative w-full h-44 overflow-hidden shadow-sm">
          <Image
            src="/banner.png"
            alt="Safety Helmet Banner"
            fill
            priority
            className="object-cover"
          />
          {/* USER 1 Dropdown inside banner */}
          <div className="absolute top-4 right-6">
            <div className="flex items-center gap-2 bg-white rounded-xl py-1.5 px-3 border border-slate-200/80 shadow-sm hover:bg-slate-50 transition-all cursor-pointer">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-100 text-violet-750 text-xs font-bold">
                <svg className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-700 select-none">USER 1</span>
              <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Inner Padding container */}
        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 select-none">
            <button
              onClick={() => setSelectedFilter(null)}
              className="hover:text-slate-600 transition-colors cursor-pointer"
            >
              Home
            </button>
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-slate-550">Dashboard</span>
            {selectedFilter && (
              <>
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
                <span className="bg-indigo-50 border border-indigo-150 rounded-full px-2.5 py-0.5 text-[10px] text-indigo-750 font-bold flex items-center gap-1 animate-fade-in animate-duration-150">
                  Kategori: {selectedFilter}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFilter(null);
                    }}
                    className="hover:text-red-550 font-bold ml-0.5 shrink-0"
                    title="Hapus filter"
                  >
                    &times;
                  </button>
                </span>
              </>
            )}
          </div>

          {/* Row 1: Work In Progress & Ringkasan Progress */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Work In Progress Card */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-4 select-none">Work In Progress</h3>
                <div className="rounded-xl border border-violet-105 bg-violet-50/20 p-4 border-dashed">
                  <p className="text-[13px] font-bold text-slate-900 leading-relaxed">
                    {selectedProcurement}
                  </p>
                </div>
              </div>

              {/* Status and Last Edit detail inputs */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Status
                  </span>
                  <div className={`inline-flex rounded-full border px-3.5 py-1 text-[11px] font-bold select-none transition-colors duration-150 ${currentProcurement.statusColor}`}>
                    {currentProcurement.status}
                  </div>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Last edit
                  </span>
                  <div className="bg-slate-55 border border-slate-200/80 rounded-lg px-3 py-1 text-[11px] font-semibold text-slate-600 max-w-[160px] select-none">
                    {currentProcurement.date}
                  </div>
                </div>
              </div>
            </div>

            {/* Ringkasan Progress Card */}
            <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-4 select-none">
                  Ringkasan Progress {selectedFilter && <span className="text-xs text-indigo-650 font-normal">({selectedFilter})</span>}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {/* On Review */}
                  <div className="rounded-xl border border-amber-255 bg-amber-50/10 p-3 flex flex-col items-center justify-center text-center transition-all duration-200">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-55 border border-amber-100 text-amber-600 mb-2">
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <span className="text-lg font-black text-slate-800 leading-none transition-all duration-200">{onReviewCount}</span>
                    <span className="text-[10px] font-bold text-slate-505 mt-1 select-none">On Review</span>
                  </div>
                  {/* Approved */}
                  <div className="rounded-xl border border-emerald-250 bg-emerald-50/10 p-3 flex flex-col items-center justify-center text-center transition-all duration-200">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-55 border border-emerald-100 text-emerald-600 mb-2">
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-lg font-black text-slate-800 leading-none transition-all duration-200">{approvedCount}</span>
                    <span className="text-[10px] font-bold text-slate-505 mt-1 select-none">Approved</span>
                  </div>
                  {/* Need Revision */}
                  <div className="rounded-xl border border-rose-200 bg-rose-50/10 p-3 flex flex-col items-center justify-center text-center transition-all duration-200">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-50 border border-rose-100 text-rose-600 mb-2">
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <span className="text-lg font-black text-slate-800 leading-none transition-all duration-200">{needRevisionCount}</span>
                    <span className="text-[10px] font-bold text-slate-505 mt-1 select-none">Need Revision</span>
                  </div>
                  {/* Draft */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 flex flex-col items-center justify-center text-center transition-all duration-200">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-505 mb-2">
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <span className="text-lg font-black text-slate-800 leading-none transition-all duration-200">{draftCount}</span>
                    <span className="text-[10px] font-bold text-slate-505 mt-1 select-none">Draft</span>
                  </div>
                </div>
              </div>
              <p className="text-[9px] font-medium text-slate-400 mt-4 italic select-none">
                * Menampilkan data pengadaan yang Anda miliki
              </p>
            </div>
          </div>

          {/* Row 2: Left Content columns & Right Content columns */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Content column: Daftar Pengadaan Saya & Dokumen Terakhir Diunggah */}
            <div className="lg:col-span-2 space-y-6">
              {/* Daftar Pengadaan Saya Table */}
              <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 select-none">
                    Daftar Pengadaan Saya {selectedFilter && <span className="text-indigo-650 font-normal">({selectedFilter})</span>}
                  </h3>
                  {selectedFilter && (
                    <button
                      onClick={() => setSelectedFilter(null)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-105">
                  <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                    <thead className="bg-slate-55 font-bold text-slate-400">
                      <tr>
                        <th scope="col" className="px-4 py-3 w-1/2">Judul Pengadaan</th>
                        <th scope="col" className="px-4 py-3 w-24">Kategori</th>
                        <th scope="col" className="px-4 py-3 w-28">Progress</th>
                        <th scope="col" className="px-4 py-3 w-24">Last Update</th>
                        <th scope="col" className="px-3 py-3 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-700">
                      {filteredProcurements.length > 0 ? (
                        filteredProcurements.map((row) => (
                          <tr
                            key={row.id}
                            className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${
                              selectedProcurement === row.title ? "bg-violet-50/10" : ""
                            }`}
                            onClick={() => setSelectedProcurement(row.title)}
                          >
                            <td className="px-4 py-3.5 font-bold text-slate-800 leading-normal max-w-sm truncate">
                              {row.title}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 text-slate-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider select-none">
                                {row.type.split(" ")[0]}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden shrink-0">
                                  <div className={`h-full ${row.progressColor}`} style={{ width: `${row.progress}%` }} />
                                </div>
                                <span className="font-extrabold text-[10px] text-slate-550">{row.progress}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-slate-400 font-semibold">{row.date}</td>
                            <td className="px-3 py-3.5 text-slate-350 text-right">
                              <svg className="h-3.5 w-3.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                              </svg>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-450 font-bold select-none">
                            Tidak ada pengadaan untuk kategori &quot;{selectedFilter}&quot;.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-center pt-2">
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="rounded-xl border border-slate-200 bg-white px-6 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
                  >
                    Lihat Semua
                  </button>
                </div>
              </div>

              {/* Dokumen Terakhir Diunggah Table */}
              <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 select-none">Dokumen Terakhir Diunggah</h3>
                <div className="overflow-x-auto rounded-xl border border-slate-105">
                  <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                    <thead className="bg-slate-55 font-bold text-slate-400">
                      <tr>
                        <th scope="col" className="px-4 py-3">Jenis Dokumen</th>
                        <th scope="col" className="px-4 py-3">Nama File</th>
                        <th scope="col" className="px-4 py-3">Tanggal Upload</th>
                        <th scope="col" className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-700">
                      {recentUploads.map((row, index) => (
                        <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3.5 font-bold text-slate-800">{row.type}</td>
                          <td className="px-4 py-3.5 text-indigo-600 font-semibold hover:underline cursor-pointer">
                            {row.filePath ? (
                              <button
                                type="button"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const url = await openDocument(row.filePath as string);
                                  if (url) {
                                    window.open(url, "_blank");
                                  } else {
                                    showToast("error", "Buka Gagal", "File tidak tersedia untuk dibuka.");
                                  }
                                }}
                                className="text-indigo-600 font-semibold hover:underline"
                              >
                                {row.fileName}
                              </button>
                            ) : (
                              <span className="opacity-60">{row.fileName}</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-slate-400 font-semibold">{row.date}</td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex rounded-md border px-2 py-0.5 text-[9px] font-bold ${row.statusColor}`}
                            >
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-center pt-2">
                  <button 
                    onClick={() => setIsUploadsModalOpen(true)}
                    className="rounded-xl border border-slate-200 bg-white px-6 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
                  >
                    Lihat Semua Dokumen
                  </button>
                </div>
              </div>
            </div>

            {/* Right Content column: Progress Penilaian & Aksi Cepat */}
            <div className="space-y-6">
              {/* Progress Penilaian Timeline */}
              <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm space-y-5">
                <h3 className="text-sm font-bold text-slate-800 select-none">Progress Penilaian</h3>
                
                {/* Vertical Timeline list (padding-based alignment, zero margin bugs) */}
                <div className="relative pl-1 flex flex-col">
                  {timelineSteps.map((step, idx) => {
                    return (
                      <div key={idx} className="relative pl-8 pb-6 text-left">
                        {/* Colored connector line segment (mathematically aligned to the dot center) */}
                        {idx < timelineSteps.length - 1 && (
                          <div
                            className={`absolute left-[11px] top-6 bottom-[-4px] w-[2px] ${
                              step.status === "completed"
                                ? "bg-emerald-500"
                                : step.status === "active"
                                ? "bg-amber-500"
                                : "bg-slate-200"
                            }`}
                          />
                        )}

                        {/* Dot Indicator */}
                        <div className="absolute left-0 top-0.5">
                          {step.status === "completed" ? (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          ) : step.status === "active" ? (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-amber-500 text-amber-500 shadow-xs">
                              <span className="h-2 w-2 rounded-full bg-amber-500" />
                            </span>
                          ) : (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white border border-slate-300 text-slate-400 shadow-xs">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                            </span>
                          )}
                        </div>

                        {/* Step Details Text Content */}
                        <div className="min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <h4 className={`text-xs font-bold transition-colors duration-150 ${step.status === "pending" ? "text-slate-400" : "text-slate-800"}`}>
                              {step.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-semibold whitespace-nowrap shrink-0">
                              {step.date}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-normal font-medium">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Komentar Terakhir Card */}
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-2 mt-2 text-left">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Komentar Terakhir
                  </span>
                  <p className="text-[11px] font-medium text-slate-650 leading-relaxed italic transition-all duration-150">
                    &quot;{comment}&quot;
                  </p>
                  <div className="text-[9px] font-bold text-slate-455 pt-1 border-t border-slate-200/50 flex items-center gap-1.5 transition-all duration-150">
                    <span className="h-1 w-1 rounded-full bg-slate-400" />
                    {commentMeta}
                  </div>
                </div>
              </div>

              {/* Aksi Cepat Widget */}
              <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-800 select-none">Aksi Cepat</h3>
                
                <button
                  onClick={() => {
                    setUploadTitle(selectedProcurement);
                    setIsUploadDocModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between rounded-xl border border-slate-150 bg-slate-50/30 p-3.5 hover:bg-slate-50 hover:border-slate-300 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-650 group-hover:scale-105 transition-transform">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800">Upload Dokumen</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-tight font-medium truncate">
                        Unggah dokumen baru untuk pengadaan ini
                      </p>
                    </div>
                  </div>
                  <svg className="h-4 w-4 text-slate-350 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 3. MODAL FOR "LIHAT SEMUA" (Daftar Pengadaan) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-800">Semua Daftar Pengadaan</h3>
                <p className="text-[11px] text-slate-455 mt-0.5 font-medium">Menampilkan seluruh data pengadaan ({procurementsTable.length} dokumen)</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              <div className="overflow-x-auto rounded-xl border border-slate-105">
                <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                  <thead className="bg-slate-55 font-bold text-slate-400">
                    <tr>
                      <th scope="col" className="px-4 py-3.5 w-12">No</th>
                      <th scope="col" className="px-4 py-3.5 w-1/2">Judul Pengadaan</th>
                      <th scope="col" className="px-4 py-3.5 w-24">Kategori</th>
                      <th scope="col" className="px-4 py-3.5 w-24">Progress</th>
                      <th scope="col" className="px-4 py-3.5 w-24">Last Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-105 bg-white font-medium text-slate-700">
                    {procurementsTable.map((row, idx) => (
                      <tr
                        key={row.id}
                        className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${
                          selectedProcurement === row.title ? "bg-violet-50/10" : ""
                        }`}
                        onClick={() => {
                          setSelectedProcurement(row.title);
                          setIsModalOpen(false);
                        }}
                      >
                        <td className="px-4 py-4 text-slate-400 font-semibold">{idx + 1}</td>
                        <td className="px-4 py-4 font-bold text-slate-900 leading-normal">
                          {row.title}
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 text-slate-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider select-none">
                            {row.type.split(" ")[0]}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden shrink-0">
                              <div className={`h-full ${row.progressColor}`} style={{ width: `${row.progress}%` }} />
                            </div>
                            <span className="font-extrabold text-[10px] text-slate-505">{row.progress}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-400 font-semibold">{row.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL FOR "LIHAT SEMUA DOKUMEN" (Dokumen Terakhir Diunggah) */}
      {isUploadsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-800">Semua Dokumen Terupload</h3>
                <p className="text-[11px] text-slate-455 mt-0.5 font-medium">Menampilkan seluruh file dokumen yang telah diunggah ({uploadedDocs.length} dokumen)</p>
              </div>
              <button
                onClick={() => setIsUploadsModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              <div className="overflow-x-auto rounded-xl border border-slate-105">
                <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                  <thead className="bg-slate-55 font-bold text-slate-400">
                    <tr>
                      <th scope="col" className="px-4 py-3.5 w-12">No</th>
                      <th scope="col" className="px-4 py-3.5 w-28">Jenis Dokumen</th>
                      <th scope="col" className="px-4 py-3.5 w-1/2">Nama File</th>
                      <th scope="col" className="px-4 py-3.5 w-32">Tanggal Upload</th>
                      <th scope="col" className="px-4 py-3.5 w-24">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-105 bg-white font-medium text-slate-700">
                    {uploadedDocs.map((row, idx) => (
                      <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-4 text-slate-400 font-semibold">{idx + 1}</td>
                        <td className="px-4 py-4 font-bold text-slate-900 leading-normal">
                          <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 text-slate-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider select-none">
                            {row.type.split(" ")[0]}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-indigo-655 font-bold hover:underline cursor-pointer">
                          {row.filePath ? (
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                const url = await openDocument(row.filePath as string);
                                if (url) {
                                  window.open(url, "_blank");
                                } else {
                                  showToast("error", "Buka Gagal", "File tidak tersedia untuk dibuka.");
                                }
                              }}
                              className="text-indigo-600 font-semibold hover:underline"
                            >
                              {row.fileName}
                            </button>
                          ) : (
                            <span className="opacity-60">{row.fileName}</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-slate-400 font-semibold">{row.date}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-md border px-2 py-0.5 text-[9px] font-bold ${row.statusColor}`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setIsUploadsModalOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL FOR "UPLOAD DOKUMEN" FORM */}
      {isUploadDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
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
    </>
  );
}
