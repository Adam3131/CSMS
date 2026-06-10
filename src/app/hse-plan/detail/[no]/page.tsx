"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "../../../../components/Sidebar";
import { DocumentItem, getDocuments } from "../../../../utils/documentStore";
import { supabase, isSupabaseConfigured } from "../../../../utils/supabaseClient";

interface HsePlanDetail {
  id: number;
  document_no: number;
  vendor_name: string;
  project_name: string;
  evaluation_date: string;
  evaluator_name: string;
  lokasi_pekerjaan: string;
  pic_jabatan: string;
  matrix_scores: {
    matrixScores: Record<string, number>;
    matrixStep3Scores: Record<string, number>;
    matrixStep8Scores: Record<string, number>;
    table1Total: number;
    table2Total: number;
    totalProses1: number;
    step3Table1Total: number;
    step3Table2Total: number;
    totalProses2: number;
    step8Total: number;
    totalHsePlanScore: number;
    percentHsePlanScore: string;
  };
  created_at: string;
}

export default function HsePlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const documentNo = parseInt(params.no as string, 10);

  const [isMounted, setIsMounted] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [docHeader, setDocHeader] = useState<DocumentItem | null>(null);
  const [detailData, setDetailData] = useState<HsePlanDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    getDocuments().then((docs) => {
      setDocuments(docs);
      const header = docs.find((d) => d.no === documentNo);
      if (header) {
        setDocHeader(header);
      }
    });

    const fetchDetail = async () => {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("hse_plan_submissions")
          .select("*")
          .eq("document_no", documentNo)
          .single();

        if (error) {
          console.warn("Detail data not found in Supabase:", error.message);
        } else if (data) {
          setDetailData(data as HsePlanDetail);
        }
      } catch (err) {
        console.error("Error fetching detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [documentNo]);

  // Read-only questionnaires mapping for display
  const step2Questions1 = [
    { key: "score1", name: "Program kampanye/ Training HSSE" },
    { key: "score2", name: "HSSE Meeting" },
    { key: "score3", name: "Management Walkthrough/ Inspeksi oleh Manajemen" },
    { key: "score4", name: "Intervensi terhadap kondisi dan perilaku Sub Standard" },
    { key: "score5", name: "Penerapan Corporate Life Saving Rules (CLSR) Pertamina" },
  ];

  const step2Questions2 = [
    { key: "score6", name: "Pemberlakuan sistem Reward terhadap kinerja HSSE yang baik/ upaya pro aktif" },
    { key: "score7", name: "Sanksi bagi pekerja yang melakukan pelanggaran aspek HSSE" },
  ];

  const step3Questions1 = [
    { key: "score3_1", name: "Pencegahan kecelakaan, luka dan sakit akibat kerja" },
    { key: "score3_2", name: "Mematuhi segala peraturan HSSE yang berlaku" },
    { key: "score3_3", name: "Menyediakan pekerja yang telah memahami/memenuhi persyaratan keahlian dalam aspek HSSE" },
    { key: "score3_4", name: "Melakukan perbaikan berkesinambungan terhadap kinerja HSSE" },
    { key: "score3_5", name: "Melarang penggunaan obat-obatan terlarang, minuman keras, penggunaan senjata api, berjudi dan berkelahi." },
  ];

  const step8Questions = [
    { key: "score8_1", bobot: 6, name: "Menyampaikan program tinjauan/ review terhadap implementasi HSSE Plan." },
    { key: "score8_2", bobot: 2, name: "Frekuensi Pelaksanaan tinjauan sesuai dengan tabel periode yang ditetapkan Pertamina." },
  ];

  if (!isMounted || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 font-sans">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-xs font-semibold">Loading HSE Plan details...</p>
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
            <button
              onClick={() => router.push("/hse-plan")}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.95] cursor-pointer"
              title="Back to HSE Plan"
            >
              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-bold tracking-tight text-slate-800">
              HSE Plan Document Review
            </h1>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold text-slate-500">
              No. {documentNo}
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

        <main className="flex-1 p-8 space-y-6 max-w-7xl w-full mx-auto animate-fade-in">
          {/* Main Info Card */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-800">General Information</h2>
              <span className="inline-flex rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                HSE Compliance Audited
              </span>
            </div>

            {detailData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs font-semibold">
                <div className="space-y-1">
                  <p className="text-slate-400 uppercase text-[9px] tracking-wider font-bold">Judul Proyek / Pekerjaan</p>
                  <p className="text-slate-800 text-sm leading-relaxed">{detailData.project_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 uppercase text-[9px] tracking-wider font-bold">Nama Perusahaan / Vendor</p>
                  <p className="text-slate-800 text-sm">{detailData.vendor_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 uppercase text-[9px] tracking-wider font-bold">Lokasi Pekerjaan</p>
                  <p className="text-slate-800 text-sm">{detailData.lokasi_pekerjaan}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 uppercase text-[9px] tracking-wider font-bold">Tanggal Verifikasi</p>
                  <p className="text-slate-800 text-sm">{new Date(detailData.evaluation_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 uppercase text-[9px] tracking-wider font-bold">Nama Evaluator</p>
                  <p className="text-slate-800 text-sm">{detailData.evaluator_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 uppercase text-[9px] tracking-wider font-bold">PIC / Jabatan</p>
                  <p className="text-slate-800 text-sm">{detailData.pic_jabatan}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
                <div className="space-y-1">
                  <p className="text-slate-400 uppercase text-[9px] tracking-wider font-bold">Judul Proyek / Pekerjaan</p>
                  <p className="text-slate-800 text-sm leading-relaxed">{docHeader?.nama || "Unknown Project"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 uppercase text-[9px] tracking-wider font-bold">Tanggal Upload</p>
                  <p className="text-slate-800 text-sm">{docHeader?.added || "Unknown Date"}</p>
                </div>
                <div className="md:col-span-2 rounded-xl bg-slate-50 border border-slate-200 p-5 mt-2 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-700">Detailed Questionnaire Log</p>
                    <p className="text-[11px] text-slate-400 font-medium">This record is a pre-seeded mockup item. Individual checklist scores and evaluator inputs were simulated.</p>
                  </div>
                  <span className="shrink-0 inline-flex rounded-lg bg-amber-50 border border-amber-100 text-amber-700 px-3 py-1.5 text-xs font-bold">Mock Data</span>
                </div>
              </div>
            )}
          </div>

          {/* Scores breakdown if detailData exists */}
          {detailData && (
            <div className="space-y-6">
              {/* Score KPI Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total HSE Plan Score</p>
                    <p className="text-3xl font-black text-slate-800">{detailData.matrix_scores.totalHsePlanScore.toFixed(2)}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shadow-inner">
                    /292
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Achievement Percentage</p>
                    <p className="text-3xl font-black text-indigo-600">{detailData.matrix_scores.percentHsePlanScore}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-inner">
                    %
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-center">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>Performance Target Rating</span>
                    <span className="text-emerald-600 font-extrabold">PASS</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mt-3 shadow-inner">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: detailData.matrix_scores.percentHsePlanScore }} />
                  </div>
                </div>
              </div>

              {/* Table breakdown: Process 1 */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 inline-block">Proses I : Kepemimpinan dan Akuntabilitas</h3>
                
                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="min-w-full divide-y divide-slate-100 text-left text-xs font-semibold">
                    <thead className="bg-slate-50 font-bold text-slate-500">
                      <tr>
                        <th scope="col" className="px-4 py-3">KOMPONEN PENILAIAN</th>
                        <th scope="col" className="px-4 py-3 w-20 text-center">BOBOT</th>
                        <th scope="col" className="px-4 py-3 w-24 text-center">SKOR MATRIKS</th>
                        <th scope="col" className="px-4 py-3 w-28 text-center">NILAI x BOBOT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                      {step2Questions1.map((q) => (
                        <tr key={q.key} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-semibold text-slate-800 leading-normal">{q.name}</td>
                          <td className="px-4 py-3 text-center">4</td>
                          <td className="px-4 py-3 text-center font-bold text-slate-500">{(detailData.matrix_scores.matrixScores[q.key] || 0).toFixed(2)}</td>
                          <td className="px-4 py-3 text-center font-extrabold text-slate-900">{((detailData.matrix_scores.matrixScores[q.key] || 0) * 4).toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50/50 font-bold text-slate-500">
                        <td className="px-4 py-3 text-right">Sub-total Budaya HSSE</td>
                        <td className="px-4 py-3 text-center">20</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-center text-slate-900 font-extrabold">{(detailData.matrix_scores.table1Total || 0).toFixed(2)}</td>
                      </tr>

                      {step2Questions2.map((q) => (
                        <tr key={q.key} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-semibold text-slate-800 leading-normal">{q.name}</td>
                          <td className="px-4 py-3 text-center">4</td>
                          <td className="px-4 py-3 text-center font-bold text-slate-500">{(detailData.matrix_scores.matrixScores[q.key] || 0).toFixed(2)}</td>
                          <td className="px-4 py-3 text-center font-extrabold text-slate-900">{((detailData.matrix_scores.matrixScores[q.key] || 0) * 4).toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50/50 font-bold text-slate-500">
                        <td className="px-4 py-3 text-right">Sub-total Reward & Sanksi</td>
                        <td className="px-4 py-3 text-center">8</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-center text-slate-900 font-extrabold">{(detailData.matrix_scores.table2Total || 0).toFixed(2)}</td>
                      </tr>
                      <tr className="bg-slate-100/50 font-extrabold text-slate-800">
                        <td className="px-4 py-3 text-right uppercase tracking-wider">Total Proses 1</td>
                        <td className="px-4 py-3 text-center">28</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-center text-blue-700 text-sm font-black">{(detailData.matrix_scores.totalProses1 || 0).toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table breakdown: Process 2 */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 inline-block">PROSES 2. KEBIJAKAN DAN SASARAN</h3>
                
                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="min-w-full divide-y divide-slate-100 text-left text-xs font-semibold">
                    <thead className="bg-slate-50 font-bold text-slate-500">
                      <tr>
                        <th scope="col" className="px-4 py-3">KOMPONEN PENILAIAN</th>
                        <th scope="col" className="px-4 py-3 w-20 text-center">BOBOT</th>
                        <th scope="col" className="px-4 py-3 w-24 text-center">SKOR MATRIKS</th>
                        <th scope="col" className="px-4 py-3 w-28 text-center">NILAI x BOBOT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                      {step3Questions1.map((q) => (
                        <tr key={q.key} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-semibold text-slate-800 leading-normal">{q.name}</td>
                          <td className="px-4 py-3 text-center">4</td>
                          <td className="px-4 py-3 text-center font-bold text-slate-500">{(detailData.matrix_scores.matrixStep3Scores[q.key] || 0).toFixed(2)}</td>
                          <td className="px-4 py-3 text-center font-extrabold text-slate-900">{((detailData.matrix_scores.matrixStep3Scores[q.key] || 0) * 4).toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-semibold text-slate-800 leading-normal">Menetapkan target pencapaian HSSE dalam kebijakan HSSE</td>
                        <td className="px-4 py-3 text-center">4</td>
                        <td className="px-4 py-3 text-center font-bold text-slate-500">{(detailData.matrix_scores.matrixStep3Scores.score3_6 || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-center font-extrabold text-slate-900">{((detailData.matrix_scores.matrixStep3Scores.score3_6 || 0) * 4).toFixed(2)}</td>
                      </tr>
                      <tr className="bg-slate-50/50 font-bold text-slate-500">
                        <td className="px-4 py-3 text-right">Sub-total Komitmen & Target</td>
                        <td className="px-4 py-3 text-center">24</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-center text-slate-900 font-extrabold">{(detailData.matrix_scores.step3Table1Total || 0).toFixed(2)}</td>
                      </tr>

                      {[
                        { key: "score3_7", name: "Lagging Indicator" },
                        { key: "score3_8", name: "Leading Indicator" },
                        { key: "score3_9", name: "KPI HSSE yang disusun sesuai format Pertamina" },
                      ].map((q) => (
                        <tr key={q.key} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-semibold text-slate-800 leading-normal">{q.name}</td>
                          <td className="px-4 py-3 text-center">4</td>
                          <td className="px-4 py-3 text-center font-bold text-slate-500">{(detailData.matrix_scores.matrixStep3Scores[q.key] || 0).toFixed(2)}</td>
                          <td className="px-4 py-3 text-center font-extrabold text-slate-900">{((detailData.matrix_scores.matrixStep3Scores[q.key] || 0) * 4).toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50/50 font-bold text-slate-500">
                        <td className="px-4 py-3 text-right">Sub-total Performance Indicator / KPI</td>
                        <td className="px-4 py-3 text-center">12</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-center text-slate-900 font-extrabold">{(detailData.matrix_scores.step3Table2Total || 0).toFixed(2)}</td>
                      </tr>
                      <tr className="bg-slate-100/50 font-extrabold text-slate-800">
                        <td className="px-4 py-3 text-right uppercase tracking-wider">Total Proses 2</td>
                        <td className="px-4 py-3 text-center">36</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-center text-blue-700 text-sm font-black">{(detailData.matrix_scores.totalProses2 || 0).toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table breakdown: Process 8 */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 inline-block">PROSES 8. TINJAUAN</h3>
                
                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="min-w-full divide-y divide-slate-100 text-left text-xs font-semibold">
                    <thead className="bg-slate-50 font-bold text-slate-500">
                      <tr>
                        <th scope="col" className="px-4 py-3">KOMPONEN PENILAIAN</th>
                        <th scope="col" className="px-4 py-3 w-20 text-center">BOBOT</th>
                        <th scope="col" className="px-4 py-3 w-24 text-center">SKOR MATRIKS</th>
                        <th scope="col" className="px-4 py-3 w-28 text-center">NILAI x BOBOT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                      {step8Questions.map((q) => (
                        <tr key={q.key} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-semibold text-slate-800 leading-normal">{q.name}</td>
                          <td className="px-4 py-3 text-center">{q.bobot}</td>
                          <td className="px-4 py-3 text-center font-bold text-slate-500">{(detailData.matrix_scores.matrixStep8Scores[q.key] || 0).toFixed(2)}</td>
                          <td className="px-4 py-3 text-center font-extrabold text-slate-900">{((detailData.matrix_scores.matrixStep8Scores[q.key] || 0) * q.bobot).toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-100/50 font-extrabold text-slate-800">
                        <td className="px-4 py-3 text-right uppercase tracking-wider">Total Proses 8</td>
                        <td className="px-4 py-3 text-center">8</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-center text-blue-700 text-sm font-black">{(detailData.matrix_scores.step8Total || 0).toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Button Back */}
              <div className="flex justify-end pt-4">
                <Link
                  href="/hse-plan"
                  className="rounded-xl border border-slate-200 bg-white px-8 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 shadow-sm active:scale-[0.98] transition-all"
                >
                  Back to Overview
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
