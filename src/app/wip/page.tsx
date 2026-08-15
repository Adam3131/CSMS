"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DocumentItem, getDocuments, deleteDocument } from "../../utils/documentStore";
import Sidebar from "../../components/Sidebar";
import { isSupabaseConfigured, supabase } from "../../utils/supabaseClient";

export default function WipLandingPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"nama" | "pelaksanaan">("nama");
  const [sortAsc, setSortAsc] = useState(true);
  
  // Expanded row state
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  
  // Form states
  const [formCompany, setFormCompany] = useState("");
  const [formType, setFormType] = useState("Time Charter");
  const [formProjectName, setFormProjectName] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formDuration, setFormDuration] = useState("");

  // Preview Modal
  const [previewData, setPreviewData] = useState<any>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    getDocuments().then(setDocuments);
  }, []);

  const wipDocumentsList = useMemo(() => {
    return documents.filter((doc) => doc.type === "WIP").map((doc) => ({
      no: doc.no,
      nama: doc.nama,
      pelaksanaan: doc.added,
      nilai: doc.nilai || "95.0",
      status: doc.status || "New",
      type: "WIP"
    }));
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

  const handleResumeClick = (doc: any) => {
    if (expandedRow === doc.no) {
      setExpandedRow(null);
    } else {
      setExpandedRow(doc.no);
      setFormCompany("");
      setFormType("Time Charter");
      setFormProjectName(doc.nama);
      setFormLocation("");
      setFormDuration("");
    }
  };

  const handleDelete = async (no: number) => {
    if (confirm("Are you sure you want to delete this WIP document?")) {
      try {
        const updated = await deleteDocument(no);
        setDocuments(updated);
      } catch (err) {
        console.error("Failed to delete document:", err);
      }
    }
  };

  const handleContinueForm = (doc: any) => {
    const params = new URLSearchParams({
      no: doc.no.toString(),
      company: formCompany,
      type: formType,
      projectName: formProjectName,
      location: formLocation,
      duration: formDuration
    });
    router.push(`/wip/create?${params.toString()}`);
  };

  const handlePreview = async (doc: any) => {
    setIsPreviewModalOpen(true);
    setIsLoadingPreview(true);
    setPreviewData(null);
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("wip_submissions")
        .select("*")
        .eq("document_no", doc.no)
        .single();
      
      if (!error && data) {
        setPreviewData(data);
      } else {
        // Mockup fallback
        setPreviewData({
          nama_perusahaan: "Mock Perusahaan",
          jenis_pekerjaan: doc.nama,
          lokasi_pekerjaan: "Mock Location",
          tanggal_penilaian: "2026-08-15",
          stage: "Stage 1",
          lagging_indicators: { row1: { target: "0", actual: "0", sanksi: "-" } },
          leading_indicators: { row1: { target: "1", actual: "1", sanksi: "-" } }
        });
      }
    } else {
      // Mockup fallback
      setPreviewData({
        nama_perusahaan: "Mock Perusahaan",
        jenis_pekerjaan: doc.nama,
        lokasi_pekerjaan: "Mock Location",
        tanggal_penilaian: "2026-08-15",
        stage: "Stage 1",
        lagging_indicators: { row1: { target: "0", actual: "0", sanksi: "-" } },
        leading_indicators: { row1: { target: "1", actual: "1", sanksi: "-" } }
      });
    }
    setIsLoadingPreview(false);
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
      <Sidebar currentPath="/wip" selectedCategory="WIP" documents={documents} />

      <div className="flex flex-1 flex-col pl-72">
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
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search WIP documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-64 rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none shadow-sm transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 font-medium"
                  />
                </div>
                <span className="text-xs text-slate-400 font-bold whitespace-nowrap">
                  Showing {sortedDocuments.length} of {wipDocumentsList.length} WIP Documents
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
                    <th scope="col" className="px-5 py-3.5 w-48 text-center">Action</th>
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
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              doc.status === 'Done' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {doc.status === 'Done' ? 'Complete' : 'New'}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-2">
                              {doc.status === 'New' || doc.status === 'On Progress' ? (
                                <button
                                  onClick={() => handleResumeClick(doc)}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-blue-700 hover:bg-blue-100 transition-colors"
                                >
                                  Resume Process
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handlePreview(doc)}
                                    className="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 hover:bg-blue-100 transition-colors"
                                  >
                                    Preview
                                  </button>
                                  <button
                                    onClick={() => router.push(`/wip/create?no=${doc.no}`)}
                                    className="inline-flex items-center rounded-lg bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 hover:bg-amber-100 transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(doc.no)}
                                    className="inline-flex items-center rounded-lg bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-700 hover:bg-rose-100 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                        {expandedRow === doc.no && (
                          <tr>
                            <td colSpan={5} className="bg-slate-50 border-t border-b border-slate-200 px-6 py-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Nama Perusahaan</label>
                                  <input 
                                    value={formCompany} 
                                    onChange={e => setFormCompany(e.target.value)} 
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none" 
                                    placeholder="Enter company name"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Tipe Pengadaan</label>
                                  <select 
                                    value={formType} 
                                    onChange={e => setFormType(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none"
                                  >
                                    <option value="Time Charter">Time Charter</option>
                                    <option value="Chartering Services">Chartering Services</option>
                                    <option value="Keagenan Kapal">Keagenan Kapal</option>
                                  </select>
                                </div>
                                <div className="space-y-1.5 col-span-2">
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Nama Pengadaan</label>
                                  <textarea 
                                    value={formProjectName} 
                                    onChange={e => setFormProjectName(e.target.value)} 
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none" 
                                    rows={2}
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Lokasi Pengadaan</label>
                                  <input 
                                    value={formLocation} 
                                    onChange={e => setFormLocation(e.target.value)} 
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none" 
                                    placeholder="Enter location"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Durasi Kontrak</label>
                                  <input 
                                    value={formDuration} 
                                    onChange={e => setFormDuration(e.target.value)} 
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none" 
                                    placeholder="e.g. 1 Year"
                                  />
                                </div>
                                <div className="col-span-2 flex justify-end gap-2 mt-2">
                                  <button onClick={() => setExpandedRow(null)} className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 bg-white">Cancel</button>
                                  <button onClick={() => handleContinueForm(doc)} className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Continue</button>
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

      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">WIP Document Preview</h3>
              <button onClick={() => setIsPreviewModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {isLoadingPreview ? (
                <div className="flex justify-center py-12"><div className="w-8 h-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>
              ) : previewData ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="block text-xs font-bold text-slate-400 uppercase">Nama Perusahaan</span><span className="font-medium text-slate-800">{previewData.nama_perusahaan}</span></div>
                    <div><span className="block text-xs font-bold text-slate-400 uppercase">Stage</span><span className="font-medium text-slate-800">{previewData.stage}</span></div>
                    <div className="col-span-2"><span className="block text-xs font-bold text-slate-400 uppercase">Jenis Pekerjaan</span><span className="font-medium text-slate-800">{previewData.jenis_pekerjaan}</span></div>
                    <div><span className="block text-xs font-bold text-slate-400 uppercase">Lokasi Pekerjaan</span><span className="font-medium text-slate-800">{previewData.lokasi_pekerjaan}</span></div>
                    <div><span className="block text-xs font-bold text-slate-400 uppercase">Tanggal Penilaian</span><span className="font-medium text-slate-800">{previewData.tanggal_penilaian}</span></div>
                  </div>
                  {/* Lagging Indicators (Stage 2) */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs text-indigo-950 uppercase tracking-wider bg-slate-50 px-3 py-1.5 rounded-lg">I. LAGGING INDICATORS</h4>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="min-w-full divide-y divide-slate-200 text-[11px]">
                        <thead className="bg-slate-50 font-bold text-slate-700">
                          <tr>
                            <th className="px-3 py-2 text-left">Indicator</th>
                            <th className="px-3 py-2 w-20 text-center">Target</th>
                            <th className="px-3 py-2 w-20 text-center">Actual</th>
                            <th className="px-3 py-2 w-28 text-left">Sanksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {[
                            { key: "row1", text: "Fatality atau Oil Spill ≥ 15 Bbls atau Property Damage ≥ USD 1.000.000" },
                            { key: "row2", text: "Luka/ cedera/ sakit menyebabkan Hari kerja hilang (Day away from work) atau 5 ≤ oil spill < 15 Bbls atau USD 100.000 ≤ Property Damage < USD 1.000.000." },
                            { key: "row3", text: "Luka/ cedera/ sakit menyebabkan penanganan dan perawatan korban melebihi P3K (Medical Treatment Cases/ restricted work days/ transfer to another job) atau 1 ≤ oil spill < 5 Bbls atau USD 10.000 ≤ Property Damage < USD 100.000." }
                          ].map((row) => {
                            const indicatorData = previewData.lagging_indicators?.[row.key] || {};
                            return (
                              <tr key={row.key} className="hover:bg-slate-50/50">
                                <td className="px-3 py-2 font-medium text-slate-700 leading-normal">{row.text}</td>
                                <td className="px-3 py-2 text-center text-slate-600 font-bold">{indicatorData.target || "-"}</td>
                                <td className="px-3 py-2 text-center text-slate-600 font-bold">{indicatorData.actual || "-"}</td>
                                <td className="px-3 py-2 text-slate-600 italic font-semibold">{indicatorData.sanksi || "-"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Leading Indicators (Stage 2) */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs text-indigo-950 uppercase tracking-wider bg-slate-50 px-3 py-1.5 rounded-lg">II. LEADING INDICATORS</h4>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="min-w-full divide-y divide-slate-200 text-[11px]">
                        <thead className="bg-slate-50 font-bold text-slate-700">
                          <tr>
                            <th className="px-3 py-2 text-left">Indicator</th>
                            <th className="px-3 py-2 w-20 text-center">Target</th>
                            <th className="px-3 py-2 w-20 text-center">Actual</th>
                            <th className="px-3 py-2 w-28 text-left">Sanksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {[
                            { key: "row1", text: "Pelaksanaan HSSE Management Walk Through (MWT)/ Manajemen Visit" },
                            { key: "row2", text: "Pemberian reward dan sanksi HSSE" },
                            { key: "row3", text: "Penyampaian laporan kinerja HSSE Pelaksana Kontrak kepada pertamina" },
                            { key: "row4", text: "Pelaksanaan HSSE Meeting" },
                            { key: "row5", text: "Mengikutsertakan pekerja dalam BPJS Ketenagakerjaan" },
                            { key: "row6", text: "Pelaksanaan HSSE Talk/ Tool Box Meeting" },
                            { key: "row7", text: "Pelaksanaan HSSE Induction" }
                          ].map((row) => {
                            const indicatorData = previewData.leading_indicators?.[row.key] || {};
                            return (
                              <tr key={row.key} className="hover:bg-slate-50/50">
                                <td className="px-3 py-2 font-medium text-slate-700 leading-normal">{row.text}</td>
                                <td className="px-3 py-2 text-center text-slate-600 font-bold">{indicatorData.target || "-"}</td>
                                <td className="px-3 py-2 text-center text-slate-600 font-bold">{indicatorData.actual || "-"}</td>
                                <td className="px-3 py-2 text-slate-600 italic font-semibold">{indicatorData.sanksi || "-"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* PJA Lagging (Stage 3) */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs text-indigo-950 uppercase tracking-wider bg-slate-50 px-3 py-1.5 rounded-lg">III. PJA LAGGING INDICATORS</h4>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="min-w-full divide-y divide-slate-200 text-[11px]">
                        <thead className="bg-slate-50 font-bold text-slate-700">
                          <tr>
                            <th className="px-3 py-2 text-left">Indicator</th>
                            <th className="px-3 py-2 w-20 text-center">Target</th>
                            <th className="px-3 py-2 w-20 text-center">Actual</th>
                            <th className="px-3 py-2 w-28 text-left">Keterangan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {[
                            { key: "row1", text: "Fatality atau Oil Spill ≥ 15 Bbls atau Property Damage ≥ USD 1.000.000" },
                            { key: "row2", text: "Luka/ cedera/ sakit menyebabkan Hari kerja hilang (Day away from work) atau 5 ≤ oil spill < 15 Bbls atau USD 100.000 ≤ Property Damage < USD 1.000.000." },
                            { key: "row3", text: "Luka/ cedera/ sakit menyebabkan penanganan dan perawatan korban melebihi P3K (Medical Treatment Cases/ restricted work days/ transfer to another job) atau 1 ≤ oil spill < 5 Bbls atau USD 10.000 ≤ Property Damage < USD 100.000." }
                          ].map((row) => {
                            const indicatorData = previewData.pja_lagging?.[row.key] || {};
                            return (
                              <tr key={row.key} className="hover:bg-slate-50/50">
                                <td className="px-3 py-2 font-medium text-slate-700 leading-normal">{row.text}</td>
                                <td className="px-3 py-2 text-center text-slate-600 font-bold">{indicatorData.target || "-"}</td>
                                <td className="px-3 py-2 text-center text-slate-600 font-bold">{indicatorData.actual || "-"}</td>
                                <td className="px-3 py-2 text-slate-600 italic font-semibold">{indicatorData.sanksi || "-"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* PJA Leading (Stage 3) */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs text-indigo-950 uppercase tracking-wider bg-slate-50 px-3 py-1.5 rounded-lg">IV. PJA LEADING INDICATORS</h4>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="min-w-full divide-y divide-slate-200 text-[11px]">
                        <thead className="bg-slate-50 font-bold text-slate-700">
                          <tr>
                            <th className="px-3 py-2 text-left">Indicator</th>
                            <th className="px-3 py-2 w-20 text-center">Target</th>
                            <th className="px-3 py-2 w-20 text-center">Actual</th>
                            <th className="px-3 py-2 w-28 text-left">Keterangan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {[
                            { key: "row1", text: "Pelaksanaan HSSE Management Walk Through (MWT)/ Manajemen Visit" },
                            { key: "row2", text: "Pemberian reward dan sanksi HSSE" },
                            { key: "row3", text: "Penyampaian laporan kinerja HSSE Pelaksana Kontrak kepada pertamina" },
                            { key: "row4", text: "Pelaksanaan HSSE Meeting" },
                            { key: "row5", text: "Mengikutsertakan pekerja dalam BPJS Ketenagakerjaan" },
                            { key: "row6", text: "Pelaksanaan HSSE Talk/ Tool Box Meeting" },
                            { key: "row7", text: "Pelaksanaan HSSE Induction" }
                          ].map((row) => {
                            const indicatorData = previewData.pja_leading?.[row.key] || {};
                            return (
                              <tr key={row.key} className="hover:bg-slate-50/50">
                                <td className="px-3 py-2 font-medium text-slate-700 leading-normal">{row.text}</td>
                                <td className="px-3 py-2 text-center text-slate-600 font-bold">{indicatorData.target || "-"}</td>
                                <td className="px-3 py-2 text-center text-slate-600 font-bold">{indicatorData.actual || "-"}</td>
                                <td className="px-3 py-2 text-slate-600 italic font-semibold">{indicatorData.sanksi || "-"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">Failed to load preview data.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
