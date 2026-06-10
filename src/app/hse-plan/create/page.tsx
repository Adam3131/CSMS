"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import { DocumentItem, getDocuments, addDocument } from "../../../utils/documentStore";
import { supabase, isSupabaseConfigured } from "../../../utils/supabaseClient";

export default function CreateHsePlanPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  
  const [isMounted, setIsMounted] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  
  // Wizard view state (step 1 to 4)
  const [hsePlanStep, setHsePlanStep] = useState<1 | 2 | 3 | 4>(1);

  // Form inputs
  const [vendorName, setVendorName] = useState("PT Warna SeBahtera");
  const [projectName, setProjectName] = useState("Pengadaan Time Charter 1 (one) Unit VLGC Laycan 19-20 Februari 2024 (LPGC SC Commander LVII)");
  const [evaluationDate, setEvaluationDate] = useState("2024-02-22");
  const [evaluatorName, setEvaluatorName] = useState("PUTRI FATIMA SUNNIA");
  const [lokasiPekerjaan, setLokasiPekerjaan] = useState("");
  const [picJabatan, setPicJabatan] = useState("");

  // Step 2 Matrix Scores (Kepemimpinan & Akuntabilitas)
  const [matrixScores, setMatrixScores] = useState<Record<string, number>>({
    score1: 0.25,
    score2: 0,
    score3: 0,
    score4: 0,
    score5: 0,
    score6: 0,
    score7: 0,
  });

  // Step 3 Matrix Scores (Kebijakan & Sasaran)
  const [matrixStep3Scores, setMatrixStep3Scores] = useState<Record<string, number>>({
    score3_1: 0,
    score3_2: 0,
    score3_3: 0,
    score3_4: 0,
    score3_5: 0,
    score3_6: 0,
    score3_7: 0,
    score3_8: 0,
    score3_9: 0,
  });

  // Step 4 Matrix Scores (Tinjauan)
  const [matrixStep8Scores, setMatrixStep8Scores] = useState<Record<string, number>>({
    score8_1: 0,
    score8_2: 0,
  });

  useEffect(() => {
    setIsMounted(true);
    getDocuments().then(setDocuments);
  }, []);

  const handleMatrixChange = (key: string, val: number) => {
    setMatrixScores((prev) => ({ ...prev, [key]: val }));
  };

  const handleStep3MatrixChange = (key: string, val: number) => {
    setMatrixStep3Scores((prev) => ({ ...prev, [key]: val }));
  };

  const handleStep8MatrixChange = (key: string, val: number) => {
    setMatrixStep8Scores((prev) => ({ ...prev, [key]: val }));
  };

  // Step 2 Totals
  const table1Total = useMemo(() => {
    const sum = (matrixScores.score1 + matrixScores.score2 + matrixScores.score3 + matrixScores.score4 + matrixScores.score5) * 4;
    return parseFloat(sum.toFixed(2));
  }, [matrixScores]);

  const table2Total = useMemo(() => {
    const sum = (matrixScores.score6 + matrixScores.score7) * 4;
    return parseFloat(sum.toFixed(2));
  }, [matrixScores]);

  const totalProses1 = useMemo(() => {
    return parseFloat((table1Total + table2Total).toFixed(2));
  }, [table1Total, table2Total]);

  // Step 3 Totals
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

  // Step 4 Totals
  const step8Total = useMemo(() => {
    const sum = (matrixStep8Scores.score8_1 * 6) + (matrixStep8Scores.score8_2 * 2);
    return parseFloat(sum.toFixed(2));
  }, [matrixStep8Scores]);

  const totalHsePlanScore = useMemo(() => {
    return parseFloat((totalProses1 + totalProses2 + step8Total).toFixed(2));
  }, [totalProses1, totalProses2, step8Total]);

  const percentHsePlanScore = useMemo(() => {
    if (totalHsePlanScore === 0) return "0%";
    return Math.round((totalHsePlanScore / 292) * 100) + "%";
  }, [totalHsePlanScore]);

  const handleSubmit = async () => {
    const dateFormatted = new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).replace(/ /g, "-");

    if (isSupabaseConfigured) {
      // 1. Insert into documents table
      const { data: docData, error: docError } = await supabase
        .from("documents")
        .insert([
          {
            nama: projectName,
            added: dateFormatted,
            added_date: new Date().toISOString(),
            status: "Done",
            type: "HSE Plan",
            nilai: percentHsePlanScore, // Save final percentage score (e.g. "45%")
          },
        ])
        .select();

      if (docError) {
        alert("Failed to save document: " + docError.message);
        return;
      }

      if (docData && docData.length > 0) {
        const docNo = docData[0].no;
        
        // 2. Insert into hse_plan_submissions table
        const { error: subError } = await supabase
          .from("hse_plan_submissions")
          .insert([
            {
              document_no: docNo,
              vendor_name: vendorName,
              project_name: projectName,
              evaluation_date: evaluationDate,
              evaluator_name: evaluatorName,
              lokasi_pekerjaan: lokasiPekerjaan,
              pic_jabatan: picJabatan,
              matrix_scores: {
                matrixScores,
                matrixStep3Scores,
                matrixStep8Scores,
                table1Total,
                table2Total,
                totalProses1,
                step3Table1Total,
                step3Table2Total,
                totalProses2,
                step8Total,
                totalHsePlanScore,
                percentHsePlanScore,
              },
            },
          ]);

        if (subError) {
          console.error("Failed to save HSE Plan details: ", subError.message);
        }
      }
    } else {
      // LocalStorage fallback (simulation mode)
      await addDocument({
        nama: projectName,
        added: dateFormatted,
        addedDate: new Date().toISOString(),
        status: "Done",
        type: "HSE Plan",
        nilai: percentHsePlanScore,
      });
    }

    alert("HSE Plan document created successfully!");
    router.push("/hse-plan");
  };

  if (!isMounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 font-sans">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-xs font-semibold">Loading Wizard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* 1. LEFT SIDEBAR */}
      <Sidebar currentPath="/hse-plan/create" selectedCategory="HSE Plan" documents={documents} />

      {/* 2. MAIN CONTENT PANEL */}
      <div className="flex flex-1 flex-col pl-72">
        {/* Sticky Header */}
        <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-200/60 bg-white/80 px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-tight text-slate-800">
              Create HSE Plan
            </h1>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold text-slate-500">
              Step {hsePlanStep} of 4
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
          {/* Breadcrumbs for step status */}
          <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-slate-200/60 shadow-sm select-none">
            <div className="flex items-center gap-6 text-xs font-bold">
              {[
                { step: 1, label: "General Information" },
                { step: 2, label: "Proses I: Leadership" },
                { step: 3, label: "Proses II: Policy & Goal" },
                { step: 4, label: "Proses VIII: Evaluation" },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${
                      hsePlanStep === s.step
                        ? "bg-blue-600 text-white shadow-sm"
                        : hsePlanStep > s.step
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {hsePlanStep > s.step ? "✓" : s.step}
                  </span>
                  <span className={hsePlanStep === s.step ? "text-slate-800" : "text-slate-400"}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-xs font-semibold text-slate-400">
              Last edit: 22 February 2026
            </div>
          </div>

          {/* Form Step 1 */}
          {hsePlanStep === 1 && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <form
                    ref={formRef}
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (formRef.current?.checkValidity()) {
                        setHsePlanStep(2);
                      } else {
                        formRef.current?.reportValidity();
                      }
                    }}
                    className="space-y-5"
                    noValidate
                  >
                    <div>
                      <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">HSE Plan Form</h3>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Judul Pekerjaan</label>
                      <input type="text" readOnly value={projectName} className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 outline-none cursor-not-allowed font-semibold" />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="lokasi-hse" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lokasi Pekerjaan</label>
                      <input type="text" id="lokasi-hse" required placeholder="Masukkan lokasi pekerjaan..." value={lokasiPekerjaan} onChange={(e) => setLokasiPekerjaan(e.target.value)} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-800 outline-none shadow-sm transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 font-semibold" />
                      <div className="error-msg text-[10px] font-semibold text-red-650 mt-1">Lokasi pekerjaan diperlukan.</div>
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="perusahaan-hse" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Perusahaan</label>
                      <input type="text" id="perusahaan-hse" required placeholder="Masukkan nama perusahaan..." value={vendorName} onChange={(e) => setVendorName(e.target.value)} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-800 outline-none shadow-sm transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 font-semibold" />
                      <div className="error-msg text-[10px] font-semibold text-red-650 mt-1">Nama perusahaan diperlukan.</div>
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="tgl-hse" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Verifikasi</label>
                      <input type="date" id="tgl-hse" required value={evaluationDate} onChange={(e) => setEvaluationDate(e.target.value)} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-800 outline-none shadow-sm transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 font-semibold" />
                      <div className="error-msg text-[10px] font-semibold text-red-650 mt-1">Tanggal verifikasi diperlukan.</div>
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="evaluator-hse" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Evaluator</label>
                      <input type="text" id="evaluator-hse" required placeholder="Masukkan nama evaluator..." value={evaluatorName} onChange={(e) => setEvaluatorName(e.target.value)} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-800 outline-none shadow-sm transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 font-semibold" />
                      <div className="error-msg text-[10px] font-semibold text-red-650 mt-1">Nama evaluator diperlukan.</div>
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="pic-hse" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">PIC - Jabatan</label>
                      <input type="text" id="pic-hse" required placeholder="Masukkan jabatan PIC..." value={picJabatan} onChange={(e) => setPicJabatan(e.target.value)} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-800 outline-none shadow-sm transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 font-semibold" />
                      <div className="error-msg text-[10px] font-semibold text-red-650 mt-1">PIC Jabatan diperlukan.</div>
                    </div>
                  </form>

                  {/* Right side: PDF Preview */}
                  <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-6">
                    <div className="space-y-4">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Document Preview (HSE Plan)</span>
                      <div className="relative border border-slate-300 rounded-lg bg-white p-6 shadow-inner aspect-[3/4] overflow-hidden flex flex-col justify-between text-slate-850 text-[7px] leading-relaxed select-none">
                        <div className="flex items-center justify-between border-b border-blue-900 pb-2">
                          <div className="text-left font-bold text-blue-900 text-[9px]">PERTAMINA</div>
                          <div className="text-right text-[6px] text-slate-400">No. Dok: HSE-CSMS-01</div>
                        </div>
                        <div className="text-center font-bold text-slate-900 uppercase my-3 space-y-1">
                          <p className="text-[8px]">Surat Keputusan</p>
                          <p className="text-[6px] text-slate-500 font-semibold">No. Kpts - 24 / C00000/2026-S0</p>
                          <p className="text-[7px] tracking-tight text-blue-950 mt-1">TENTANG PEMBERLAKUAN PEDOMAN CONTRACTOR SAFETY MANAGEMENT SYSTEM (CSMS)</p>
                        </div>
                        <div className="flex-1 space-y-2 py-2 text-slate-600">
                          <p className="font-semibold text-slate-800">DIREKTUR UTAMA PT PERTAMINA (PERSERO),</p>
                          <p className="text-[6.5px]">Sistem Manajemen Keselamatan Kontraktor (CSMS) wajib dipenuhi untuk memitigasi seluruh aktivitas operasional di kapal VLGC Laycan.</p>
                        </div>
                        <div className="flex justify-end pt-2">
                          <div className="text-right w-24">
                            <p>Jakarta, 2026</p>
                            <p className="font-bold text-slate-800">Direktur Utama</p>
                            <div className="h-6 w-full flex items-center justify-center my-0.5 border border-dashed border-slate-200 text-slate-300 font-bold">Signature</div>
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
                        <button type="button" onClick={() => alert("Simulating PDF full view...")} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50">View File</button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end gap-3 mt-6 border-t border-slate-200 pt-4">
                      <button type="button" onClick={() => router.push("/hse-plan")} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                      <button type="button" onClick={() => { if (lokasiPekerjaan && picJabatan) { setHsePlanStep(2); } else { formRef.current?.reportValidity(); } }} className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-650 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:from-blue-500 hover:to-indigo-500 transition-all active:scale-[0.98]">Continue</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Step 2 */}
          {hsePlanStep === 2 && (
            <div className="space-y-6">
              {/* Header variables info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
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
              </div>

              {/* Step 2 Scoring tables */}
              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 inline-block">Proses I : Kepemimpinan dan Akuntabilitas</h3>
                </div>

                {/* Sub-table 1 */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-700">1. Promosi budaya HSSE yang melibatkan level Manajemen yang mencakup :</p>
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
                                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none focus:bg-white w-full font-semibold"
                              >
                                <option value="0">0.00</option>
                                <option value="0.25">0.25</option>
                                <option value="0.5">0.50</option>
                                <option value="1">1.00</option>
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
                          <td className="px-4 py-3 text-center text-slate-950 text-sm">{(table1Total).toFixed(2)}</td>
                          <td className="px-4 py-3"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Sub-table 2 */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-700">2. Penghargaan dan Sanksi terkait Aspek HSSE</p>
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
                                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none focus:bg-white w-full font-semibold"
                              >
                                <option value="0">0.00</option>
                                <option value="0.25">0.25</option>
                                <option value="0.5">0.50</option>
                                <option value="1">1.00</option>
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
                          <td className="px-4 py-3 text-center text-slate-950 text-sm">{(table2Total).toFixed(2)}</td>
                          <td className="px-4 py-3"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Sub-totals & Navigation */}
                <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-5 items-center font-bold text-xs">
                  <div className="text-slate-500 uppercase tracking-wider">Total Proses 1</div>
                  <div className="text-center text-sm text-slate-950 bg-slate-50 border border-slate-200 rounded px-4 py-1.5">{(totalProses1).toFixed(2)}</div>
                  <div></div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-5">
                  <button type="button" onClick={() => setHsePlanStep(1)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">&lt; Back</button>
                  <div className="text-xs text-slate-400 font-bold">
                    Total Score So Far: <span className="text-blue-600 font-extrabold">{totalProses1.toFixed(2)}</span>
                  </div>
                  <button type="button" onClick={() => setHsePlanStep(3)} className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-650 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:from-blue-500 hover:to-indigo-500 transition-all active:scale-[0.98]">Next &gt;</button>
                </div>
              </div>
            </div>
          )}

          {/* Form Step 3 */}
          {hsePlanStep === 3 && (
            <div className="space-y-6">
              {/* Header info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
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
              </div>

              {/* Process 2 Table Assessment */}
              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 inline-block">PROSES 2. KEBIJAKAN DAN SASARAN</h3>
                </div>

                {/* Sub-table 1: HSSE Policy & Objective */}
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-700">1. HSSE Policy Dan Objective</p>
                  
                  <div className="space-y-2 pl-4">
                    <p className="text-xs font-semibold text-slate-650">1. Komitmen HSSE</p>
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
                                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none focus:bg-white w-full font-semibold"
                                >
                                  <option value="0">0.00</option>
                                  <option value="0.25">0.25</option>
                                  <option value="0.5">0.50</option>
                                  <option value="1">1.00</option>
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

                  {/* Sub-table 2: Target Kebijakan HSSE */}
                  <div className="space-y-2 pl-4">
                    <p className="text-xs font-semibold text-slate-650">2. Target kebijakan HSSE</p>
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                      <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                        <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-700">
                          <tr className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-semibold text-slate-800">Menetapkan target pencapaian HSSE dalam kebijakan HSSE</td>
                            <td className="px-4 py-3 w-20 text-center font-bold">4</td>
                            <td className="px-4 py-2 w-32">
                              <select
                                value={matrixStep3Scores.score3_6}
                                onChange={(e) => handleStep3MatrixChange("score3_6", parseFloat(e.target.value))}
                                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none focus:bg-white w-full font-semibold"
                              >
                                <option value="0">0.00</option>
                                <option value="0.25">0.25</option>
                                <option value="0.5">0.50</option>
                                <option value="1">1.00</option>
                              </select>
                            </td>
                            <td className="px-4 py-3 w-24 text-center text-slate-900 font-bold font-semibold">
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

                {/* Sub-table 3: KPI */}
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-700">2. HSSE PERFORMANCE INDICATOR / KPI (KEY PERFORMANCE INDICATOR)</p>
                  
                  <div className="space-y-2 pl-4">
                    <p className="text-xs font-semibold text-slate-650">1. Menyusun indikator pencapaian kinerja (KPI) HSSE yang terdiri dari :</p>
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                      <table className="min-w-full divide-y divide-slate-100 text-left text-xs font-medium">
                        <thead className="bg-slate-50 font-bold text-slate-500">
                          <tr>
                            <th scope="col" className="px-4 py-3">KOMPONEN PENILAIAN HSE PLAN</th>
                            <th scope="col" className="px-4 py-3 w-20 text-center">BOBOT</th>
                            <th scope="col" className="px-4 py-3 w-32">Nilai Matriks</th>
                            <th scope="col" className="px-4 py-3 w-24 text-center">Nilai x Bobot</th>
                            <th scope="col" className="px-4 py-3 w-36">Keterangan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
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
                                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none focus:bg-white w-full font-semibold"
                                >
                                  <option value="0">0.00</option>
                                  <option value="0.25">0.25</option>
                                  <option value="0.5">0.50</option>
                                  <option value="1">1.00</option>
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

                {/* Subtotals & Navigation */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-5">
                  <button type="button" onClick={() => setHsePlanStep(2)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">&lt; Back</button>
                  <div className="text-xs text-slate-400 font-bold">
                    Total Score So Far: <span className="text-blue-700 font-extrabold">{(totalProses1 + totalProses2).toFixed(2)}</span>
                  </div>
                  <button type="button" onClick={() => setHsePlanStep(4)} className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-655 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:from-blue-500 hover:to-indigo-500 transition-all active:scale-[0.98]">Next &gt;</button>
                </div>
              </div>
            </div>
          )}

          {/* Form Step 4 */}
          {hsePlanStep === 4 && (
            <div className="space-y-6">
              {/* Header info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
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
              </div>

              {/* Process 8 Table Assessment */}
              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 inline-block">PROSES 8. TINJAUAN</h3>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-700">1. HSSE Policy Dan Objective</p>
                  
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="min-w-full divide-y divide-slate-100 text-left text-xs font-medium">
                      <thead className="bg-slate-50 font-bold text-slate-500">
                        <tr>
                          <th scope="col" className="px-4 py-3">KOMPONEN PENILAIAN HSE PLAN</th>
                          <th scope="col" className="px-4 py-3 w-20 text-center">BOBOT</th>
                          <th scope="col" className="px-4 py-3 w-32">Nilai Matriks</th>
                          <th scope="col" className="px-4 py-3 w-24 text-center">Nilai x Bobot</th>
                          <th scope="col" className="px-4 py-3 w-36">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                        {[
                          { key: "score8_1", bobot: 6, name: "Menyampaikan program tinjauan/ review terhadap implementasi HSSE Plan." },
                          { key: "score8_2", bobot: 2, name: "Frekuensi Pelaksanaan tinjauan sesuai dengan tabel periode yang ditetapkan Pertamina." },
                        ].map((row) => (
                          <tr key={row.key} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-semibold text-slate-800">{row.name}</td>
                            <td className="px-4 py-3 text-center">{row.bobot}</td>
                            <td className="px-4 py-2">
                              <select
                                value={matrixStep8Scores[row.key]}
                                onChange={(e) => handleStep8MatrixChange(row.key, parseFloat(e.target.value))}
                                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs outline-none focus:bg-white w-full font-semibold"
                              >
                                <option value="0">0.00</option>
                                <option value="0.25">0.25</option>
                                <option value="0.5">0.50</option>
                                <option value="1">1.00</option>
                              </select>
                            </td>
                            <td className="px-4 py-3 text-center text-slate-900 font-bold">
                              {(matrixStep8Scores[row.key] * row.bobot).toFixed(2)}
                            </td>
                            <td className="px-4 py-2">
                              <input type="text" placeholder="Catatan..." className="w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 outline-none text-xs py-1" />
                            </td>
                          </tr>
                        ))}
                        
                        {/* Total Proses 8 */}
                        <tr className="bg-slate-50/50 font-bold">
                          <td className="px-4 py-3 text-right">Total Proses 8</td>
                          <td className="px-4 py-3 text-center">8</td>
                          <td className="px-4 py-3"></td>
                          <td className="px-4 py-3 text-center text-slate-950 text-sm">{step8Total.toFixed(2)}</td>
                          <td className="px-4 py-3"></td>
                        </tr>

                        {/* Total BOBOT HSSE PLAN */}
                        <tr className="bg-slate-50/50 font-bold">
                          <td className="px-4 py-3 text-right">Total BOBOT HSSE PLAN</td>
                          <td className="px-4 py-3 text-center">292</td>
                          <td className="px-4 py-3"></td>
                          <td className="px-4 py-3 text-center text-slate-950 text-sm">292.00</td>
                          <td className="px-4 py-3"></td>
                        </tr>

                        {/* TOTAL PENCAPAIAN NILAI HSE PLAN */}
                        <tr className="bg-slate-50/50 font-bold text-blue-700">
                          <td className="px-4 py-3 text-right">TOTAL PENCAPAIAN NILAI HSE PLAN</td>
                          <td className="px-4 py-3 text-center"></td>
                          <td className="px-4 py-3"></td>
                          <td className="px-4 py-3 text-center text-sm">{totalHsePlanScore.toFixed(0)}</td>
                          <td className="px-4 py-3"></td>
                        </tr>

                        {/* % PENCAPAIAN NILAI HSE PLAN */}
                        <tr className="bg-slate-50/50 font-extrabold text-indigo-700">
                          <td className="px-4 py-3 text-right">% PENCAPAIAN NILAI HSE PLAN</td>
                          <td className="px-4 py-3 text-center"></td>
                          <td className="px-4 py-3"></td>
                          <td className="px-4 py-3 text-center text-sm">{percentHsePlanScore}</td>
                          <td className="px-4 py-3"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Total Semua Proses section full width */}
                <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden flex text-xs font-bold">
                  <div className="bg-slate-100 text-slate-600 px-6 py-4 w-2/3 border-r border-slate-200 text-right uppercase tracking-wider">
                    Total Semua Proses
                  </div>
                  <div className="bg-white text-slate-900 px-6 py-4 w-1/3 text-center text-sm font-black">
                    {totalHsePlanScore.toFixed(2)}
                  </div>
                </div>

                {/* Subtotals & Submit Action */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-5">
                  <button type="button" onClick={() => setHsePlanStep(3)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">&lt; Back</button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full sm:w-auto px-10 py-3.5 bg-gradient-to-br from-blue-600 to-indigo-650 text-white text-xs font-extrabold rounded-xl shadow-md hover:from-blue-500 hover:to-indigo-500 transition-all active:scale-[0.98] uppercase tracking-wider text-center"
                  >
                    Finish & Submit
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
