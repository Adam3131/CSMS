"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DocumentItem, getDocuments } from "../../utils/documentStore";
import Sidebar from "../../components/Sidebar";
import { supabase, isSupabaseConfigured } from "../../utils/supabaseClient";

const MOCK_PROCUREMENTS = [
  {
    perusahaan: "PT Warna SeBahtera",
    pengadaan: "Pengadaan Time Charter 1 (one) Unit VLGC Laycan 19-20 Februari 2024 (LPGC SC Commander LVII)",
    tipe: "Time Charter",
    lokasi: "Jakarta / Bontang",
    durasi: "12 Months",
    nilai: "Click to access form",
    feedback: "HSE Plan document has been verified. Ready for Pre-Job Assessment."
  },
  {
    perusahaan: "PT Samudera Logistics",
    pengadaan: "Penyediaan Kapal Anchor Handling Tug Supply (AHTS) untuk Wilayah Kerja Mahakam",
    tipe: "Chartering Services",
    lokasi: "Balikpapan",
    durasi: "24 Months",
    nilai: "Click to access form",
    feedback: "Waiting for PJA questionnaire submission."
  },
  {
    perusahaan: "PT Trans Bahari",
    pengadaan: "Pengadaan Jasa Keagenan Kapal Tanker di Terminal Khusus Ruwais",
    tipe: "Keagenan Kapal",
    lokasi: "Terminal Khusus Ruwais",
    durasi: "6 Months",
    nilai: "Click to access form",
    feedback: "HSE compliance documents are up to date."
  }
];

export default function PjeLandingPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"nama" | "added">("nama");
  const [sortAsc, setSortAsc] = useState(true);
  
  // Collapsible accordion form states
  const [expandedDocNo, setExpandedDocNo] = useState<number | null>(null);
  const [formCompany, setFormCompany] = useState("");
  const [formType, setFormType] = useState("Time Charter");
  const [formProjectName, setFormProjectName] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formDuration, setFormDuration] = useState("");

  // Preview Modal states
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    getDocuments().then(setDocuments);
  }, []);

  const pjaDocuments = useMemo(() => {
    return documents.filter((doc) => doc.type === "PJA");
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    return pjaDocuments.filter((doc) =>
      doc.nama.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [pjaDocuments, searchQuery]);

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

  const handleResumeProcessClick = (doc: DocumentItem) => {
    if (expandedDocNo === doc.no) {
      setExpandedDocNo(null);
    } else {
      setExpandedDocNo(doc.no);
      setFormProjectName(doc.nama);
      setFormCompany("");
      setFormType("Time Charter");
      setFormLocation("");
      setFormDuration("");
    }
  };

  const handlePreviewClick = async (doc: DocumentItem) => {
    setPreviewDoc(doc);
    setPreviewData(null);
    setIsPreviewLoading(true);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from("pja_submissions")
          .select("*")
          .eq("document_no", doc.no)
          .single();
        if (data && !error) {
          setPreviewData(data);
        } else {
          setPreviewData({
            vendor_name: "PT Warna SeBahtera",
            project_name: doc.nama,
            bidang_usaha: "Jasa Pelayaran & Pengangkutan Gas",
            evaluation_date: "2024-02-22",
            evaluator_name: "PUTRI FATIMA SUNNIA",
            pic_jabatan: "Environmental & HSSE Governance",
            lokasi_pekerjaan: "Jakarta / Bontang",
            answers: {
              scoreP1_1: "YES",
              scoreP1_2: "YES",
              scoreP1_3: "NO",
              scoreP1_4: "YES",
              scoreP7_1: "YES",
              scoreP7_2: "NO",
            },
            notes: {
              scoreP1_1: "Sertifikat valid",
              scoreP1_2: "Laporan tersedia",
              scoreP1_3: "Dokumen kurang",
              scoreP1_4: "SOP lengkap",
              scoreP7_1: "Evaluasi rutin",
              scoreP7_2: "Rencana perbaikan belum ada",
            },
            due_date: "2024-03-31",
            findings: "Review compliance documents complete.",
            recommendation: "Follow up on corrective actions before final closure.",
            status: "open",
          });
        }
      } catch (err) {
        console.error("Error loading preview:", err);
      } finally {
        setIsPreviewLoading(false);
      }
    } else {
      setPreviewData({
        vendor_name: "PT Warna SeBahtera",
        project_name: doc.nama,
        bidang_usaha: "Jasa Pelayaran & Pengangkutan Gas",
        evaluation_date: "2024-02-22",
        evaluator_name: "PUTRI FATIMA SUNNIA",
        pic_jabatan: "Environmental & HSSE Governance",
        lokasi_pekerjaan: "Jakarta / Bontang",
        answers: {
          scoreP1_1: "YES",
          scoreP1_2: "YES",
          scoreP1_3: "NO",
          scoreP1_4: "YES",
          scoreP7_1: "YES",
          scoreP7_2: "NO",
        },
        notes: {
          scoreP1_1: "Sertifikat valid",
          scoreP1_2: "Laporan tersedia",
          scoreP1_3: "Dokumen kurang",
          scoreP1_4: "SOP lengkap",
          scoreP7_1: "Evaluasi rutin",
          scoreP7_2: "Rencana perbaikan belum ada",
        },
        due_date: "2024-03-31",
        findings: "Review compliance documents complete.",
        recommendation: "Follow up on corrective actions before final closure.",
        status: "open",
      });
      setIsPreviewLoading(false);
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
      <Sidebar currentPath="/pje" selectedCategory="PJA" documents={documents} />

      {/* 2. MAIN CONTENT PANEL */}
      <div className="flex flex-1 flex-col pl-72">
        {/* Sticky Header */}
        <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-200/60 bg-white/80 px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-tight text-slate-800">
              Pre Job Assessment (PJA)
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
                <span className="border border-blue-500 bg-blue-500/25 px-3 py-1 rounded-lg text-blue-300 font-extrabold shadow-sm shadow-blue-500/20">
                  PJA
                </span>
                <span className="opacity-40">──</span>
                <span className="opacity-60 cursor-default">WIP</span>
                <span className="opacity-40">──</span>
                <span className="opacity-60 cursor-default">FE</span>
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-300">
                Pre Job Assessment Phase
              </div>
            </div>
          </div>

          {/* PJA Compliance Documents Table */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-650 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.95] cursor-pointer"
                  title="Back to Dashboard"
                >
                  <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  PJA Compliance Documents
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-white pl-4 pr-10 py-1.5 text-xs text-slate-900 placeholder-slate-400 outline-none shadow-sm transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 font-medium"
                  />
                </div>
                <span className="text-xs text-slate-400 font-bold shrink-0 text-right">
                  Showing {sortedDocuments.length} of {pjaDocuments.length} PJA Documents
                </span>
              </div>
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
                      onClick={() => handleSort("added")}
                      className="px-5 py-3.5 cursor-pointer hover:bg-slate-100 transition-colors group select-none w-44"
                    >
                      <div className="flex items-center gap-1">
                        Pelaksanaan
                        <span className="text-slate-400 group-hover:text-slate-600">
                          {sortField === "added" ? (sortAsc ? "↑" : "↓") : "↕"}
                        </span>
                      </div>
                    </th>
                    <th scope="col" className="px-5 py-3.5 w-32 text-center">Status</th>
                    <th scope="col" className="px-5 py-3.5 w-32">Nilai</th>
                    <th scope="col" className="px-5 py-3.5 w-36 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                  {sortedDocuments.length > 0 ? (
                    sortedDocuments.map((doc, idx) => {
                      const isExpanded = expandedDocNo === doc.no;
                      return (
                        <React.Fragment key={doc.no}>
                          <tr className="hover:bg-slate-50/50 transition-all">
                            <td className="px-5 py-4 text-slate-400">{idx + 1}</td>
                            <td className="px-5 py-4 font-semibold text-slate-900 leading-relaxed max-w-md">
                              {doc.nama}
                            </td>
                            <td className="px-5 py-4 text-slate-500 font-semibold">{doc.added}</td>
                            <td className="px-5 py-4 text-center">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${
                                  doc.status === "New"
                                    ? "bg-red-50 border-red-100 text-red-655"
                                    : doc.status === "On Progress"
                                    ? "bg-amber-50 border-amber-100 text-amber-655"
                                    : "bg-emerald-50 border-emerald-100 text-emerald-655"
                                }`}
                              >
                                {doc.status === "New" ? "New" : "Complete"}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-blue-700 font-bold">
                              {doc.status === "New" ? "-" : (doc.nilai || "6.00")}
                            </td>
                            <td className="px-5 py-4 text-center">
                              {doc.status === "New" ? (
                                <button
                                  type="button"
                                  onClick={() => handleResumeProcessClick(doc)}
                                  className="inline-flex rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-650 hover:bg-indigo-100 px-3 py-1.5 text-[10px] font-extrabold transition-all cursor-pointer font-sans"
                                >
                                  {isExpanded ? "Hide Form" : "Resume Process"}
                                </button>
                              ) : (
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handlePreviewClick(doc)}
                                    className="inline-flex rounded-lg bg-blue-50 border border-blue-200 text-blue-650 hover:bg-blue-100 px-2.5 py-1.5 text-[10px] font-extrabold transition-all cursor-pointer font-sans"
                                  >
                                    Preview
                                  </button>
                                  <Link
                                    href={`/pje/create?no=${doc.no}`}
                                    className="inline-flex rounded-lg bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200 px-2.5 py-1.5 text-[10px] font-extrabold transition-all font-sans"
                                  >
                                    Edit
                                  </Link>
                                </div>
                              )}
                            </td>
                          </tr>
                          
                          {/* Collapsible Accordion Form */}
                          {isExpanded && (
                            <tr className="bg-slate-50/40">
                              <td colSpan={6} className="px-8 py-6 border-b border-slate-100">
                                <div className="max-w-3xl border border-slate-200 rounded-2xl bg-white p-6 shadow-sm space-y-4">
                                  <div className="border-b border-slate-100 pb-3">
                                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                                      Resume Pre Job Assessment Process
                                    </h4>
                                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                                      Silakan isi detail pengadaan kontraktor di bawah ini sebelum melanjutkan ke kuesioner.
                                    </p>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Nama Perusahaan</label>
                                      <input
                                        type="text"
                                        placeholder="Masukkan nama perusahaan..."
                                        value={formCompany}
                                        onChange={(e) => setFormCompany(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10"
                                      />
                                    </div>

                                    <div className="space-y-1.5">
                                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Tipe Pengadaan</label>
                                      <select
                                        value={formType}
                                        onChange={(e) => setFormType(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10"
                                      >
                                        <option value="Time Charter">Time Charter</option>
                                        <option value="Chartering Services">Chartering Services</option>
                                        <option value="Keagenan Kapal">Keagenan Kapal</option>
                                      </select>
                                    </div>

                                    <div className="space-y-1.5 md:col-span-2">
                                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Nama Pengadaan</label>
                                      <textarea
                                        rows={2}
                                        value={formProjectName}
                                        onChange={(e) => setFormProjectName(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 resize-none leading-relaxed"
                                      />
                                    </div>

                                    <div className="space-y-1.5">
                                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Lokasi Pengadaan</label>
                                      <input
                                        type="text"
                                        placeholder="Masukkan lokasi..."
                                        value={formLocation}
                                        onChange={(e) => setFormLocation(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10"
                                      />
                                    </div>

                                    <div className="space-y-1.5">
                                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Durasi Kontrak</label>
                                      <input
                                        type="text"
                                        placeholder="Masukkan durasi..."
                                        value={formDuration}
                                        onChange={(e) => setFormDuration(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                    <button
                                      type="button"
                                      onClick={() => setExpandedDocNo(null)}
                                      className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-bold text-slate-655 hover:bg-slate-50 transition-all cursor-pointer font-sans"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const params = new URLSearchParams({
                                          no: doc.no.toString(),
                                          company: formCompany,
                                          projectName: formProjectName,
                                          location: formLocation,
                                          type: formType,
                                          duration: formDuration
                                        });
                                        router.push(`/pje/create?${params.toString()}`);
                                      }}
                                      className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-650 px-6 py-2 text-xs font-bold text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer font-sans"
                                    >
                                      Continue
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-400 font-bold">
                        No PJA documents matching &quot;{searchQuery}&quot;
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Preview Modal */}
        {previewDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 p-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Pre Job Assessment (PJA) Detail Preview
                  </h3>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    No. Dokumen: {previewDoc.no}
                  </p>
                </div>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-655 transition-colors cursor-pointer"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {isPreviewLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-650 border-t-transparent" />
                    <p className="text-xs font-semibold text-slate-400">Loading PJA details...</p>
                  </div>
                ) : previewData ? (
                  <div className="space-y-6 text-xs text-slate-700">
                    {/* General Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-slate-200/60 bg-slate-50/50 p-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Nama Perusahaan</p>
                        <p className="font-bold text-slate-800 mt-1 text-left">{previewData.vendor_name || "-"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Bidang Usaha</p>
                        <p className="font-bold text-slate-800 mt-1 text-left">{previewData.bidang_usaha || "-"}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Nama Pengadaan</p>
                        <p className="font-semibold text-slate-800 leading-relaxed mt-1 text-left">{previewData.project_name || "-"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Lokasi Pekerjaan</p>
                        <p className="font-semibold text-slate-750 mt-1 text-left">{previewData.lokasi_pekerjaan || "-"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Tanggal Verifikasi</p>
                        <p className="font-semibold text-slate-750 mt-1 text-left">{previewData.evaluation_date || "-"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Evaluator</p>
                        <p className="font-bold text-slate-800 mt-1 text-left">{previewData.evaluator_name || "-"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">PIC Jabatan</p>
                        <p className="font-semibold text-slate-755 mt-1 text-left">{previewData.pic_jabatan || "-"}</p>
                      </div>
                    </div>

                    {/* Checklist Questionnaire Assessment */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide text-left">Questionnaire Assessment Details</h4>
                      <div className="border border-slate-100 rounded-xl overflow-hidden">
                        <table className="min-w-full divide-y divide-slate-100 text-left text-xs font-medium">
                          <thead className="bg-slate-50 font-bold text-slate-505">
                            <tr>
                              <th className="px-4 py-3">Pertanyaan</th>
                              <th className="px-4 py-3 w-28 text-center">Jawaban</th>
                              <th className="px-4 py-3 w-48">Keterangan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white text-slate-750">
                            {[
                              { key: "scoreP1_1", q: "Apakah Kontraktor telah memiliki Kebijakan & Sasaran Aspek HSSE?" },
                              { key: "scoreP1_2", q: "Apakah Kontraktor memiliki HSSE Plan sesuai dengan sifat pekerjaan?" },
                              { key: "scoreP1_3", q: "Apakah Kontraktor memiliki struktur organisasi HSSE yang memadai?" },
                              { key: "scoreP1_4", q: "Apakah Kontraktor memiliki SOP aspek HSSE?" },
                              { key: "scoreP7_1", q: "Apakah ada rencana pemantauan & tinjauan aspek HSSE berkala?" },
                              { key: "scoreP7_2", q: "Apakah rencana mitigasi kecelakaan kerja sudah disusun?" },
                            ].map((item) => {
                              const answer = previewData.answers?.[item.key];
                              const note = previewData.notes?.[item.key] || "-";
                              return (
                                <tr key={item.key} className="hover:bg-slate-50/50">
                                  <td className="px-4 py-3 leading-relaxed font-semibold text-slate-800 text-left">{item.q}</td>
                                  <td className="px-4 py-3 text-center">
                                    <span
                                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase ${
                                        answer === "YES"
                                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                          : answer === "NO"
                                          ? "bg-red-50 text-red-600 border border-red-100"
                                          : "bg-slate-100 text-slate-500"
                                      }`}
                                    >
                                      {answer || "N/A"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-slate-500 italic font-medium text-left">{note}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Findings / Recommendation / Status */}
                    {(previewData.findings || previewData.recommendation || previewData.status || previewData.keterangan || previewData.due_date) && (
                      <div className="space-y-3 border-t border-slate-100 pt-4">
                        <div className="overflow-hidden rounded-xl border border-slate-200">
                          <table className="min-w-full border-collapse text-left text-xs font-medium">
                            <thead className="bg-slate-50 text-slate-700">
                              <tr>
                                <th className="border border-slate-200 px-3 py-2 text-left font-bold uppercase tracking-wider">Findings</th>
                                <th className="border border-slate-200 px-3 py-2 text-left font-bold uppercase tracking-wider">Recommendation</th>
                                <th className="border border-slate-200 px-3 py-2 text-left font-bold uppercase tracking-wider w-32">Status</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white text-slate-700">
                              <tr>
                                <td className="border border-slate-200 px-3 py-3 align-top whitespace-pre-line">
                                  {previewData.findings || previewData.keterangan || "-"}
                                </td>
                                <td className="border border-slate-200 px-3 py-3 align-top whitespace-pre-line">
                                  {previewData.recommendation || "-"}
                                </td>
                                <td className="border border-slate-200 px-3 py-3 align-top">
                                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase border ${
                                    (previewData.status || "open") === "close"
                                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                      : "bg-amber-50 text-amber-600 border-amber-100"
                                  }`}>
                                    {previewData.status || "open"}
                                  </span>
                                  {previewData.due_date && (
                                    <div className="mt-3 text-[10px] text-slate-500">
                                      <p className="font-bold uppercase tracking-wider text-slate-400 mb-1">Due Date</p>
                                      <p>{previewData.due_date}</p>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 font-bold">
                    No detailed assessment data found.
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-100 bg-slate-50/50 p-4 rounded-b-2xl flex justify-end">
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-2 text-xs font-bold text-slate-655 hover:bg-slate-50 transition-all cursor-pointer font-sans"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
