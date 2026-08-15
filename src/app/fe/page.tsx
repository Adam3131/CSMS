"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DocumentItem, getDocuments } from "../../utils/documentStore";
import Sidebar from "../../components/Sidebar";
import { isSupabaseConfigured, supabase } from "../../utils/supabaseClient";

const DEFAULT_FE_ROWS = [
  { no: 1, nama: "Pengadaan Time Charter 1 (one) Unit VLGC Laycan 19-20 Februari 2024 (LPGC SC Commander LVII)", pelaksanaan: "23-Aug-2025", nilai: "100.0", type: "FE", status: "New" },
  { no: 2, nama: "Pengadaan Time Charter 1 (satu) Unit Small 2 LPGC Pressurized Laycan 20-21 Februari 2024 (LPGC Gas Laura)", pelaksanaan: "06-Aug-2025", nilai: "98.0", type: "FE", status: "Done" },
  { no: 3, nama: "LPGC Jenggala", pelaksanaan: "11-Apr-2026", nilai: "80.0", type: "FE", status: "New" },
  { no: 4, nama: "Time Charter 1 (satu) Unit Small 2 LPGC Pressurized Laycan 10-11 Maret 2024 (LPGC Gas Artemis)", pelaksanaan: "10-Mar-2023", nilai: "100.0", type: "FE", status: "Done" },
  { no: 5, nama: "Pengadaan Time Charter 1 (satu) unit small LPGC Pressurized Laycan 25-26 April 2024 (LPGC Gas Indonesia II)", pelaksanaan: "1-Jan-2022", nilai: "91.0", type: "FE", status: "Done" },
  { no: 6, nama: "Pengadaan Time Charter 1 (satu) unit small LPGC Pressurized Laycan 23-24 Mei 2024 (LPGC Gas Kalimantan)", pelaksanaan: "MT Lorem Ipsum", nilai: "88.0", type: "FE", status: "New" }
];

export default function FeLandingPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"nama" | "pelaksanaan">("nama");
  const [sortAsc, setSortAsc] = useState(true);

  // Expanded row state
  const [expandedRowNo, setExpandedRowNo] = useState<number | null>(null);
  const [formCompany, setFormCompany] = useState("");
  const [formType, setFormType] = useState("Time Charter");
  const [formProjectName, setFormProjectName] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formDuration, setFormDuration] = useState("");

  // Preview Modal State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    getDocuments().then(setDocuments);
  }, []);

  const feDocumentsList = useMemo(() => {
    const dynamicFeDocs = documents.filter((doc) => doc.type === "FE");
    if (isSupabaseConfigured) {
      return dynamicFeDocs.map((doc) => ({
        no: doc.no,
        nama: doc.nama,
        pelaksanaan: doc.added,
        nilai: doc.nilai || "95.0",
        type: "FE",
        status: doc.status
      }));
    }
    
    const rows: any[] = [...DEFAULT_FE_ROWS];
    dynamicFeDocs.forEach((doc) => {
      const exists = rows.some((row) => row.nama.toLowerCase() === doc.nama.toLowerCase());
      if (!exists) {
        rows.push({
          no: doc.no || rows.length + 1,
          nama: doc.nama,
          pelaksanaan: doc.added,
          nilai: doc.nilai || "95.0",
          type: "FE",
          status: doc.status || "New"
        });
      }
    });
    return rows;
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    return feDocumentsList.filter((doc) =>
      doc.nama.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [feDocumentsList, searchQuery]);

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

  const handleResumeProcess = (doc: any) => {
    if (expandedRowNo === doc.no) {
      setExpandedRowNo(null);
      return;
    }
    setExpandedRowNo(doc.no);
    setFormCompany("");
    setFormType("Time Charter");
    setFormProjectName(doc.nama);
    setFormLocation("");
    setFormDuration("");
  };

  const handleContinueForm = (no: number) => {
    const params = new URLSearchParams({
      no: no.toString(),
      company: formCompany,
      projectName: formProjectName,
      location: formLocation,
      type: formType,
      duration: formDuration
    });
    router.push(`/fe/create?${params.toString()}`);
  };

  const handlePreview = async (doc: any) => {
    setShowPreviewModal(true);
    setIsPreviewLoading(true);
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("fe_submissions")
          .select("*")
          .eq("document_no", doc.no)
          .single();
        if (data && !error) {
          setPreviewData(data);
        } else {
          setPreviewData({
            project_name: doc.nama,
            total_temuan: 0,
            status_temuan: "Closed",
            hse_score: doc.nilai,
            rekomendasi_close: "Mockup record (No DB data)"
          });
        }
      } else {
        setPreviewData({
          project_name: doc.nama,
          total_temuan: 0,
          status_temuan: "Closed",
          hse_score: doc.nilai,
          rekomendasi_close: "Mockup record"
        });
      }
    } catch (e) {
      console.error(e);
      setPreviewData({
        project_name: doc.nama,
        total_temuan: 0,
        status_temuan: "Closed",
        hse_score: doc.nilai,
        rekomendasi_close: "Error loading record"
      });
    }
    setIsPreviewLoading(false);
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
      <Sidebar currentPath="/fe" selectedCategory="FE" documents={documents} />

      <div className="flex flex-1 flex-col pl-72">
        <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-200/60 bg-white/80 px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-tight text-slate-800">
              Final Evaluation (FE)
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
          <div className="relative overflow-hidden rounded-2xl bg-slate-900 h-44 shadow-sm border border-slate-200/50">
            <Image
              src="/banner.png"
              alt="HSE Corporate Standards Banner"
              fill
              className="object-cover opacity-90 object-center"
              priority
            />
            <div className="absolute inset-x-0 bottom-0 bg-slate-950/45 backdrop-blur-md border-t border-white/10 px-6 py-3 flex items-center justify-between text-white select-none">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wide">
                <Link href="/hse-plan" className="opacity-60 hover:opacity-100 transition-opacity">PQ</Link>
                <span className="opacity-40">──</span>
                <Link href="/pje" className="opacity-60 hover:opacity-100 transition-opacity">PJA</Link>
                <span className="opacity-40">──</span>
                <Link href="/wip" className="opacity-60 hover:opacity-100 transition-opacity">WIP</Link>
                <span className="opacity-40">──</span>
                <span className="border border-green-500 bg-green-500/25 px-3 py-1 rounded-lg text-green-300 font-extrabold shadow-sm shadow-green-500/20">
                  FE
                </span>
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-300">
                Final Evaluation Phase
              </div>
            </div>
          </div>

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
                  Final Evaluation
                </h2>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative w-64">
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
                    className="block w-full rounded-xl border border-slate-200 bg-white pl-4 pr-10 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none shadow-sm transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 font-medium"
                  />
                </div>
                <span className="text-xs text-slate-400 font-bold">
                  Showing {sortedDocuments.length} of {feDocumentsList.length} FE Documents
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
                          {sortField === "nama" ? (sortAsc ? "↑" : "↓") : "↓"}
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
                    <th scope="col" className="px-5 py-3.5 w-32">Status</th>
                    <th scope="col" className="px-5 py-3.5 w-28 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-705">
                  {sortedDocuments.length > 0 ? (
                    sortedDocuments.map((doc, idx) => (
                      <React.Fragment key={doc.no}>
                        <tr className="hover:bg-slate-55/40 transition-all">
                          <td className="px-5 py-4 text-slate-400">{idx + 1}</td>
                          <td className="px-5 py-4 font-semibold text-slate-900 leading-relaxed max-w-md">
                            {doc.nama}
                          </td>
                          <td className="px-5 py-4 text-slate-500 font-semibold">{doc.pelaksanaan}</td>
                          <td className="px-5 py-4">
                            {doc.status === "Done" ? (
                              <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                Complete
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                New
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-3">
                              {doc.status === "Done" ? (
                                <>
                                  <button
                                    onClick={() => handlePreview(doc)}
                                    className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                                    title="Preview Evaluation"
                                  >
                                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => alert("Edit not implemented")}
                                    className="text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                                    title="Edit Document"
                                  >
                                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleResumeProcess(doc)}
                                  className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 transition-colors whitespace-nowrap"
                                >
                                  Resume Process
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {/* Collapsible Form Row */}
                        {expandedRowNo === doc.no && (
                          <tr>
                            <td colSpan={5} className="bg-slate-50 p-6 border-b border-slate-100">
                              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Resume Evaluation Data</h3>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Nama Perusahaan</label>
                                    <input
                                      type="text"
                                      value={formCompany}
                                      onChange={(e) => setFormCompany(e.target.value)}
                                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Tipe Pengadaan</label>
                                    <select
                                      value={formType}
                                      onChange={(e) => setFormType(e.target.value)}
                                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 bg-white"
                                    >
                                      <option value="Time Charter">Time Charter</option>
                                      <option value="Chartering Services">Chartering Services</option>
                                      <option value="Keagenan Kapal">Keagenan Kapal</option>
                                    </select>
                                  </div>
                                  <div className="space-y-1.5 col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Nama Pengadaan</label>
                                    <textarea
                                      value={formProjectName}
                                      onChange={(e) => setFormProjectName(e.target.value)}
                                      rows={2}
                                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Lokasi Pengadaan</label>
                                    <input
                                      type="text"
                                      value={formLocation}
                                      onChange={(e) => setFormLocation(e.target.value)}
                                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Durasi Kontrak</label>
                                    <input
                                      type="text"
                                      value={formDuration}
                                      onChange={(e) => setFormDuration(e.target.value)}
                                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                  <button onClick={() => setExpandedRowNo(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                                  <button onClick={() => handleContinueForm(doc.no)} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700">Continue</button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-400 font-bold">
                        No FE documents matching "{searchQuery}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-sm font-bold text-slate-800">FE Document Preview</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {isPreviewLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                </div>
              ) : previewData ? (
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Project Name</span>
                    <p className="font-semibold text-slate-800">{previewData.project_name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Total Temuan</span>
                      <p className="font-semibold text-slate-800">{previewData.total_temuan}</p>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Status Temuan</span>
                      <p className="font-semibold text-slate-800">{previewData.status_temuan}</p>
                    </div>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">HSE Score</span>
                    <p className="font-bold text-blue-600 text-lg">{previewData.hse_score}</p>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Rekomendasi</span>
                    <p className="font-medium text-slate-600">{previewData.rekomendasi_close}</p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-slate-500 text-sm">No data found.</p>
              )}
            </div>
            <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="rounded-lg bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
