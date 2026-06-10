"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import { DocumentItem, getDocuments, addDocument } from "../../../utils/documentStore";
import { supabase } from "../../../utils/supabaseClient";

function WipCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);

  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string; visible: boolean } | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message, visible: true });
    if (type === "success") {
      setTimeout(() => setToast(null), 3500);
    }
  };

  // Wizard state: 1, 2, or 3
  const [wipStep, setWipStep] = useState<1 | 2 | 3>(1);

  // Form states prefilled from searchParams or defaults
  const [wipAssessmentStage, setWipAssessmentStage] = useState("");
  const [wipNamaPerusahaan, setWipNamaPerusahaan] = useState("PT Warna SeBahtera");
  const [wipJenisPekerjaan, setWipJenisPekerjaan] = useState(
    "Jasa Pelayaran & Pengangkutan Gas"
  );
  const [wipLokasiPekerjaan, setWipLokasiPekerjaan] = useState("");
  const [wipTanggalPenilaian, setWipTanggalPenilaian] = useState("2024-02-22");
  const [wipEvaluator, setWipEvaluator] = useState("PUTRI FATIMA SUNNIA");
  const [wipStatus, setWipStatus] = useState("On Review by PIC");
  const [wipLastEdit, setWipLastEdit] = useState("22 February 2026");

  // Sync parameters from landing page
  useEffect(() => {
    setIsMounted(true);
    getDocuments().then(setDocuments);

    const projectParam = searchParams.get("projectName");
    const pelaksanaanParam = searchParams.get("pelaksanaan");
    const assessmentParam = searchParams.get("penilaianKe");

    if (projectParam) setWipJenisPekerjaan(projectParam);
    if (pelaksanaanParam) setWipTanggalPenilaian(pelaksanaanParam);
    if (assessmentParam) {
      if (assessmentParam === "1") setWipAssessmentStage("Stage 1 - Awal Pekerjaan");
      else if (assessmentParam === "2") setWipAssessmentStage("Stage 2 - Pertengahan Pekerjaan");
      else if (assessmentParam === "3") setWipAssessmentStage("Stage 3 - Akhir Pekerjaan");
    }
  }, [searchParams]);

  // Indicator States - WIP Step 2 (Lagging)
  const [wipLagging, setWipLagging] = useState<Record<string, { target: string; actual: string; sanksi: string }>>({
    row1: { target: "", actual: "", sanksi: "" },
    row2: { target: "", actual: "", sanksi: "" },
    row3: { target: "", actual: "", sanksi: "" },
  });

  // Indicator States - WIP Step 2 (Leading)
  const [wipLeading, setWipLeading] = useState<Record<string, { target: string; actual: string; sanksi: string }>>({
    row1: { target: "", actual: "", sanksi: "" },
    row2: { target: "", actual: "", sanksi: "" },
    row3: { target: "", actual: "", sanksi: "" },
    row4: { target: "", actual: "", sanksi: "" },
    row5: { target: "", actual: "", sanksi: "" },
    row6: { target: "", actual: "", sanksi: "" },
    row7: { target: "", actual: "", sanksi: "" },
  });

  // Indicator States - WIP Step 3 (PJA Lagging)
  const [wipPjaIndicators, setWipPjaIndicators] = useState<Record<string, { target: string; actual: string; sanksi: string }>>({
    row1: { target: "", actual: "", sanksi: "" },
    row2: { target: "", actual: "", sanksi: "" },
    row3: { target: "", actual: "", sanksi: "" },
  });

  // Indicator States - WIP Step 3 (PJA Leading)
  const [wipLeadingStep3, setWipLeadingStep3] = useState<Record<string, { target: string; actual: string; sanksi: string }>>({
    row1: { target: "", actual: "", sanksi: "" },
    row2: { target: "", actual: "", sanksi: "" },
    row3: { target: "", actual: "", sanksi: "" },
    row4: { target: "", actual: "", sanksi: "" },
    row5: { target: "", actual: "", sanksi: "" },
    row6: { target: "", actual: "", sanksi: "" },
    row7: { target: "", actual: "", sanksi: "" },
  });

  const handleFinishSubmit = async () => {
    setIsSubmitting(true);
    const dateFormatted = new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).replace(/ /g, "-");

    try {
      const updatedDocs = await addDocument({
        nama: wipJenisPekerjaan,
        added: dateFormatted,
        addedDate: new Date().toISOString(),
        status: "Done",
        type: "WIP",
        nilai: "96.0",
      });

      const newDocNo = updatedDocs[0]?.no ?? null;
      if (!newDocNo) {
        throw new Error("Could not determine new document number for WIP submission.");
      }

      const { error: wipError } = await supabase.from("wip_submissions").insert([
        {
          document_no: newDocNo,
          stage: wipAssessmentStage,
          nama_perusahaan: wipNamaPerusahaan,
          jenis_pekerjaan: wipJenisPekerjaan,
          lokasi_pekerjaan: wipLokasiPekerjaan,
          tanggal_penilaian: wipTanggalPenilaian || null,
          evaluator: wipEvaluator,
          lagging_indicators: wipLagging,
          leading_indicators: wipLeading,
          pja_lagging: wipPjaIndicators,
          pja_leading: wipLeadingStep3,
        },
      ]);

      if (wipError) {
        throw wipError;
      }

      showToast("success", "WIP document created successfully! Redirecting...");
      setTimeout(() => router.push("/wip"), 2000);
    } catch (error) {
      console.error("Failed to submit WIP entry:", error);
      showToast("error", "Failed to save WIP submission. Please try again.");
      setIsSubmitting(false);
    }
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
    <>
      <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
        {/* 1. LEFT SIDEBAR */}
        <Sidebar currentPath="/wip/create" selectedCategory="WIP" documents={documents} />

      {/* 2. MAIN CONTENT PANEL */}
      <div className="flex flex-1 flex-col pl-72">
        {/* Sticky Header */}
        <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-200/60 bg-white/80 px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-tight text-slate-800">
              Create Work In Progress (WIP)
            </h1>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold text-slate-500">
              Step {wipStep} of 3
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
          {/* Step Breadcrumbs */}
          <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-slate-200/60 shadow-sm select-none">
            <div className="flex items-center gap-6 text-xs font-bold">
              {[
                { step: 1, label: "General Information" },
                { step: 2, label: "WIP Performance Indicators" },
                { step: 3, label: "PJA Compliance Verification" },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${
                      wipStep === s.step
                        ? "bg-blue-600 text-white shadow-sm"
                        : wipStep > s.step
                        ? "bg-emerald-100 text-emerald-700 font-bold"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {wipStep > s.step ? "✓" : s.step}
                  </span>
                  <span className={wipStep === s.step ? "text-slate-800" : "text-slate-400"}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-xs font-semibold text-slate-400">
              Last edit: 22 February 2026
            </div>
          </div>

          {/* STEP 1: General Form details */}
          {wipStep === 1 && (
            <div className="rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm">
              <form
                ref={formRef}
                onSubmit={(e) => {
                  e.preventDefault();
                  if (formRef.current?.checkValidity()) {
                    setWipStep(2);
                  } else {
                    formRef.current?.reportValidity();
                  }
                }}
                className="space-y-6 max-w-2xl mx-auto"
                noValidate
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">
                    WIP Form Details
                  </h3>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="wip-stage" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    WIP assessment stages
                  </label>
                  <select
                    id="wip-stage"
                    required
                    value={wipAssessmentStage}
                    onChange={(e) => setWipAssessmentStage(e.target.value)}
                    className="block w-full rounded-xl border border-transparent bg-slate-100/90 px-4 py-3.5 text-xs font-semibold text-slate-800 outline-none focus:bg-slate-200/60 transition-all cursor-pointer"
                  >
                    <option value="">Choose stage...</option>
                    <option value="Stage 1 - Awal Pekerjaan">Stage 1 - Awal Pekerjaan</option>
                    <option value="Stage 2 - Pertengahan Pekerjaan">Stage 2 - Pertengahan Pekerjaan</option>
                    <option value="Stage 3 - Akhir Pekerjaan">Stage 3 - Akhir Pekerjaan</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="wip-company" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Nama Perusahaan
                  </label>
                  <input
                    type="text"
                    id="wip-company"
                    required
                    placeholder="PT Warna SeBahtera"
                    value={wipNamaPerusahaan}
                    onChange={(e) => setWipNamaPerusahaan(e.target.value)}
                    className="block w-full rounded-xl border border-transparent bg-slate-100/90 px-4 py-3.5 text-xs font-semibold text-slate-800 outline-none focus:bg-slate-200/60 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="wip-job" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Jenis Pekerjaan
                  </label>
                  <input
                    type="text"
                    id="wip-job"
                    required
                    placeholder="Jasa Pelayaran & Pengangkutan Gas"
                    value={wipJenisPekerjaan}
                    onChange={(e) => setWipJenisPekerjaan(e.target.value)}
                    className="block w-full rounded-xl border border-transparent bg-slate-100/90 px-4 py-3.5 text-xs font-semibold text-slate-800 outline-none focus:bg-slate-200/60 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="wip-location" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Lokasi Pekerjaan
                  </label>
                  <input
                    type="text"
                    id="wip-location"
                    required
                    placeholder="Masukkan lokasi pekerjaan..."
                    value={wipLokasiPekerjaan}
                    onChange={(e) => setWipLokasiPekerjaan(e.target.value)}
                    className="block w-full rounded-xl border border-transparent bg-slate-100/90 px-4 py-3.5 text-xs font-semibold text-slate-800 outline-none focus:bg-slate-200/60 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="wip-date" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Tanggal Penilaian
                  </label>
                  <input
                    type="date"
                    id="wip-date"
                    required
                    value={wipTanggalPenilaian}
                    onChange={(e) => setWipTanggalPenilaian(e.target.value)}
                    className="block w-full rounded-xl border border-transparent bg-slate-100/90 px-4 py-3.5 text-xs font-semibold text-slate-800 outline-none focus:bg-slate-200/60 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="wip-evaluator" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Evaluator
                  </label>
                  <input
                    type="text"
                    id="wip-evaluator"
                    required
                    placeholder="PUTRI FATIMA SUNNIA"
                    value={wipEvaluator}
                    onChange={(e) => setWipEvaluator(e.target.value)}
                    className="block w-full rounded-xl border border-transparent bg-slate-100/90 px-4 py-3.5 text-xs font-semibold text-slate-800 outline-none focus:bg-slate-200/60 transition-all"
                  />
                </div>

                <div className="flex justify-end pt-4 gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => router.push("/wip")}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-55 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-650 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98]"
                  >
                    Continue
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: WIP Performance Indicators (Lagging & Leading) */}
          {wipStep === 2 && (
            <div className="rounded-2xl border border-indigo-100 bg-[#E8EBF9]/65 p-8 shadow-sm space-y-6">
              <div className="flex justify-start">
                <span className="inline-flex rounded-full bg-white px-5 py-2 text-xs font-extrabold text-indigo-950 uppercase tracking-wide shadow-sm select-none">
                  PENCAPAIAN LAGGING INDICATOR
                </span>
              </div>

              {/* Lagging indicator table */}
              <div className="overflow-x-auto rounded-lg border border-slate-350 shadow-sm bg-white">
                <table className="min-w-full border-collapse text-left text-xs font-medium">
                  <thead className="bg-white text-slate-850 font-bold border-b border-slate-300">
                    <tr>
                      <th className="px-4 py-3 border-r border-slate-300 uppercase font-extrabold w-[50%]">
                        LAGGING INDICATOR
                      </th>
                      <th className="px-2 py-3 border-r border-slate-300 text-center uppercase font-extrabold w-[12%]">
                        Target
                      </th>
                      <th className="px-2 py-3 border-r border-slate-300 text-center uppercase font-extrabold w-[12%]">
                        Aktual
                      </th>
                      <th className="px-2 py-3 border-r border-slate-300 text-center uppercase font-extrabold w-[20%]">
                        Sanksi Kerja
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-300">
                    {[
                      { key: "row1", text: "Fatality atau Oil Spill ≥ 15 Bbls atau Property Damage ≥ USD 1.000.000" },
                      {
                        key: "row2",
                        text: "Luka/ cedera/ sakit menyebabkan Hari kerja hilang (Day away from work) atau 5 ≤ oil spill < 15 Bbls atau USD 100.000 ≤ Property Damage < USD 1.000.000.",
                      },
                      {
                        key: "row3",
                        text: "Luka/ cedera/ sakit menyebabkan penanganan dan perawatan korban melebihi P3K (Medical Treatment Cases/ restricted work days/ transfer to another job) atau 1 ≤ oil spill < 5 Bbls atau USD 10.000 ≤ Property Damage < USD 100.000.",
                      },
                    ].map((row) => (
                      <tr key={row.key} className="border-b border-slate-300 hover:bg-slate-50/50">
                        <td className="px-4 py-3 border-r border-slate-300 font-bold text-slate-800 leading-relaxed max-w-md">
                          {row.text}
                        </td>
                        <td className="p-1 border-r border-slate-300">
                          <input
                            type="text"
                            placeholder="Target..."
                            value={wipLagging[row.key].target}
                            onChange={(e) =>
                              setWipLagging((prev) => ({
                                ...prev,
                                [row.key]: { ...prev[row.key], target: e.target.value },
                              }))
                            }
                            className="w-full h-full bg-transparent px-2 py-1.5 text-center text-xs font-semibold text-slate-800 outline-none"
                          />
                        </td>
                        <td className="p-1 border-r border-slate-300">
                          <input
                            type="text"
                            placeholder="Aktual..."
                            value={wipLagging[row.key].actual}
                            onChange={(e) =>
                              setWipLagging((prev) => ({
                                ...prev,
                                [row.key]: { ...prev[row.key], actual: e.target.value },
                              }))
                            }
                            className="w-full h-full bg-transparent px-2 py-1.5 text-center text-xs font-semibold text-slate-800 outline-none"
                          />
                        </td>
                        <td className="p-1 border-r border-slate-300">
                          <input
                            type="text"
                            placeholder="Sanksi..."
                            value={wipLagging[row.key].sanksi}
                            onChange={(e) =>
                              setWipLagging((prev) => ({
                                ...prev,
                                [row.key]: { ...prev[row.key], sanksi: e.target.value },
                              }))
                            }
                            className="w-full h-full bg-transparent px-2 py-1.5 text-center text-xs font-semibold text-slate-800 outline-none"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Leading indicators */}
              <div className="flex justify-start pt-4">
                <span className="inline-flex rounded-full bg-white px-5 py-2 text-xs font-extrabold text-indigo-950 uppercase tracking-wide shadow-sm select-none">
                  PENCAPAIAN LEADING INDICATOR
                </span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-350 shadow-sm bg-white">
                <table className="min-w-full border-collapse text-left text-xs font-medium">
                  <thead className="bg-white text-slate-850 font-bold border-b border-slate-300">
                    <tr>
                      <th className="px-4 py-3 border-r border-slate-300 uppercase font-extrabold w-[50%]">
                        LEADING INDICATOR
                      </th>
                      <th className="px-2 py-3 border-r border-slate-300 text-center uppercase font-extrabold w-[12%]">
                        Target
                      </th>
                      <th className="px-2 py-3 border-r border-slate-300 text-center uppercase font-extrabold w-[12%]">
                        Aktual
                      </th>
                      <th className="px-2 py-3 border-r border-slate-300 text-center uppercase font-extrabold w-[20%]">
                        Sanksi Kerja
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-300">
                    {[
                      { key: "row1", text: "Pelaksanaan HSSE Management Walk Through (MWT)/ Manajemen Visit" },
                      { key: "row2", text: "Pemberian reward dan sanksi HSSE" },
                      {
                        key: "row3",
                        text: "Penyampaian laporan kinerja HSSE Pelaksana Kontrak kepada pertamina",
                      },
                      { key: "row4", text: "Pelaksanaan HSSE Meeting" },
                      { key: "row5", text: "Mengikutsertakan pekerja dalam BPJS Ketenagakerjaan" },
                      { key: "row6", text: "Pelaksanaan HSSE Talk/ Tool Box Meeting" },
                      { key: "row7", text: "Pelaksanaan HSSE Induction" },
                    ].map((row) => (
                      <tr key={row.key} className="border-b border-slate-300 hover:bg-slate-50/50">
                        <td className="px-4 py-3 border-r border-slate-300 font-bold text-slate-800 leading-relaxed max-w-md">
                          {row.text}
                        </td>
                        <td className="p-1 border-r border-slate-300">
                          <input
                            type="text"
                            placeholder="Target..."
                            value={wipLeading[row.key].target}
                            onChange={(e) =>
                              setWipLeading((prev) => ({
                                ...prev,
                                [row.key]: { ...prev[row.key], target: e.target.value },
                              }))
                            }
                            className="w-full h-full bg-transparent px-2 py-1.5 text-center text-xs font-semibold text-slate-800 outline-none"
                          />
                        </td>
                        <td className="p-1 border-r border-slate-300">
                          <input
                            type="text"
                            placeholder="Aktual..."
                            value={wipLeading[row.key].actual}
                            onChange={(e) =>
                              setWipLeading((prev) => ({
                                ...prev,
                                [row.key]: { ...prev[row.key], actual: e.target.value },
                              }))
                            }
                            className="w-full h-full bg-transparent px-2 py-1.5 text-center text-xs font-semibold text-slate-800 outline-none"
                          />
                        </td>
                        <td className="p-1 border-r border-slate-300">
                          <input
                            type="text"
                            placeholder="Sanksi..."
                            value={wipLeading[row.key].sanksi}
                            onChange={(e) =>
                              setWipLeading((prev) => ({
                                ...prev,
                                [row.key]: { ...prev[row.key], sanksi: e.target.value },
                              }))
                            }
                            className="w-full h-full bg-transparent px-2 py-1.5 text-center text-xs font-semibold text-slate-800 outline-none"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setWipStep(1)}
                  className="rounded-xl border border-slate-205 bg-white px-5 py-2.5 text-xs font-semibold text-slate-655 hover:bg-slate-50 active:scale-[0.98] shadow-sm"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setWipStep(3)}
                  className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-650 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98]"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PJA Compliance Verification matrices */}
          {wipStep === 3 && (
            <div className="rounded-2xl border border-indigo-100 bg-[#E8EBF9]/65 p-8 shadow-sm space-y-6">
              <div className="flex justify-start">
                <span className="inline-flex rounded-full bg-white px-5 py-2 text-xs font-extrabold text-indigo-950 uppercase tracking-wide shadow-sm select-none">
                  II. PENILAIAN SEBELUM PEKERJAAN BERLANGSUNG (PJA) LAGGING
                </span>
              </div>

              {/* PJA Lagging table */}
              <div className="overflow-x-auto rounded-lg border border-slate-355 shadow-sm bg-white">
                <table className="min-w-full border-collapse text-left text-xs font-medium">
                  <thead className="bg-white text-slate-850 font-bold border-b border-slate-300">
                    <tr>
                      <th className="px-4 py-3 border-r border-slate-300 uppercase font-extrabold w-[50%]">
                        PJA LAGGING INDICATOR
                      </th>
                      <th className="px-2 py-3 border-r border-slate-300 text-center uppercase font-extrabold w-[12%]">
                        Target
                      </th>
                      <th className="px-2 py-3 border-r border-slate-300 text-center uppercase font-extrabold w-[12%]">
                        Aktual
                      </th>
                      <th className="px-2 py-3 border-r border-slate-300 text-center uppercase font-extrabold w-[20%]">
                        Sanksi Kerja
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-300">
                    {[
                      { key: "row1", text: "Fatality atau Oil Spill ≥ 15 Bbls atau Property Damage ≥ USD 1.000.000" },
                      {
                        key: "row2",
                        text: "Luka/ cedera/ sakit menyebabkan Hari kerja hilang (Day away from work) atau 5 ≤ oil spill < 15 Bbls atau USD 100.000 ≤ Property Damage < USD 1.000.000.",
                      },
                      {
                        key: "row3",
                        text: "Luka/ cedera/ sakit menyebabkan penanganan dan perawatan korban melebihi P3K (Medical Treatment Cases/ restricted work days/ transfer to another job) atau 1 ≤ oil spill < 5 Bbls atau USD 10.000 ≤ Property Damage < USD 100.000.",
                      },
                    ].map((row) => (
                      <tr key={row.key} className="border-b border-slate-300 hover:bg-slate-50/50">
                        <td className="px-4 py-3 border-r border-slate-300 font-bold text-slate-800 leading-relaxed max-w-md">
                          {row.text}
                        </td>
                        <td className="p-1 border-r border-slate-300">
                          <input
                            type="text"
                            placeholder="Target..."
                            value={wipPjaIndicators[row.key].target}
                            onChange={(e) =>
                              setWipPjaIndicators((prev) => ({
                                ...prev,
                                [row.key]: { ...prev[row.key], target: e.target.value },
                              }))
                            }
                            className="w-full h-full bg-transparent px-2 py-1.5 text-center text-xs font-semibold text-slate-800 outline-none"
                          />
                        </td>
                        <td className="p-1 border-r border-slate-300">
                          <input
                            type="text"
                            placeholder="Aktual..."
                            value={wipPjaIndicators[row.key].actual}
                            onChange={(e) =>
                              setWipPjaIndicators((prev) => ({
                                ...prev,
                                [row.key]: { ...prev[row.key], actual: e.target.value },
                              }))
                            }
                            className="w-full h-full bg-transparent px-2 py-1.5 text-center text-xs font-semibold text-slate-800 outline-none"
                          />
                        </td>
                        <td className="p-1 border-r border-slate-300">
                          <input
                            type="text"
                            placeholder="Sanksi..."
                            value={wipPjaIndicators[row.key].sanksi}
                            onChange={(e) =>
                              setWipPjaIndicators((prev) => ({
                                ...prev,
                                [row.key]: { ...prev[row.key], sanksi: e.target.value },
                              }))
                            }
                            className="w-full h-full bg-transparent px-2 py-1.5 text-center text-xs font-semibold text-slate-800 outline-none"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PJA Leading indicators */}
              <div className="flex justify-start pt-4">
                <span className="inline-flex rounded-full bg-white px-5 py-2 text-xs font-extrabold text-indigo-955 uppercase tracking-wide shadow-sm select-none">
                  PJA LEADING INDICATOR
                </span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-355 shadow-sm bg-white">
                <table className="min-w-full border-collapse text-left text-xs font-medium">
                  <thead className="bg-white text-slate-850 font-bold border-b border-slate-300">
                    <tr>
                      <th className="px-4 py-3 border-r border-slate-300 uppercase font-extrabold w-[50%]">
                        PJA LEADING INDICATOR
                      </th>
                      <th className="px-2 py-3 border-r border-slate-300 text-center uppercase font-extrabold w-[12%]">
                        Target
                      </th>
                      <th className="px-2 py-3 border-r border-slate-300 text-center uppercase font-extrabold w-[12%]">
                        Aktual
                      </th>
                      <th className="px-2 py-3 border-r border-slate-300 text-center uppercase font-extrabold w-[20%]">
                        Sanksi Kerja
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-300">
                    {[
                      { key: "row1", text: "Pelaksanaan HSSE Management Walk Through (MWT)/ Manajemen Visit" },
                      { key: "row2", text: "Pemberian reward dan sanksi HSSE" },
                      {
                        key: "row3",
                        text: "Penyampaian laporan kinerja HSSE Pelaksana Kontrak kepada pertamina",
                      },
                      { key: "row4", text: "Pelaksanaan HSSE Meeting" },
                      { key: "row5", text: "Mengikutsertakan pekerja dalam BPJS Ketenagakerjaan" },
                      { key: "row6", text: "Pelaksanaan HSSE Talk/ Tool Box Meeting" },
                      { key: "row7", text: "Pelaksanaan HSSE Induction" },
                    ].map((row) => (
                      <tr key={row.key} className="border-b border-slate-300 hover:bg-slate-50/50">
                        <td className="px-4 py-3 border-r border-slate-300 font-bold text-slate-800 leading-relaxed max-w-md">
                          {row.text}
                        </td>
                        <td className="p-1 border-r border-slate-300">
                          <input
                            type="text"
                            placeholder="Target..."
                            value={wipLeadingStep3[row.key].target}
                            onChange={(e) =>
                              setWipLeadingStep3((prev) => ({
                                ...prev,
                                [row.key]: { ...prev[row.key], target: e.target.value },
                              }))
                            }
                            className="w-full h-full bg-transparent px-2 py-1.5 text-center text-xs font-semibold text-slate-800 outline-none"
                          />
                        </td>
                        <td className="p-1 border-r border-slate-300">
                          <input
                            type="text"
                            placeholder="Aktual..."
                            value={wipLeadingStep3[row.key].actual}
                            onChange={(e) =>
                              setWipLeadingStep3((prev) => ({
                                ...prev,
                                [row.key]: { ...prev[row.key], actual: e.target.value },
                              }))
                            }
                            className="w-full h-full bg-transparent px-2 py-1.5 text-center text-xs font-semibold text-slate-800 outline-none"
                          />
                        </td>
                        <td className="p-1 border-r border-slate-300">
                          <input
                            type="text"
                            placeholder="Sanksi..."
                            value={wipLeadingStep3[row.key].sanksi}
                            onChange={(e) =>
                              setWipLeadingStep3((prev) => ({
                                ...prev,
                                [row.key]: { ...prev[row.key], sanksi: e.target.value },
                              }))
                            }
                            className="w-full h-full bg-transparent px-2 py-1.5 text-center text-xs font-semibold text-slate-800 outline-none"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setWipStep(2)}
                  className="rounded-xl border border-slate-205 bg-white px-5 py-2.5 text-xs font-semibold text-slate-655 hover:bg-slate-50 active:scale-[0.98] shadow-sm"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleFinishSubmit}
                  disabled={isSubmitting}
                  className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-650 px-8 py-3 text-xs font-extrabold text-white shadow-md hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] transition-all uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Submitting..." : "Finish & Submit"}
                </button>
              </div>
            </div>
          )}
        </main>
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-start gap-4 rounded-2xl px-5 py-4 shadow-2xl transition-all duration-500 ${
              toast.type === "success"
                ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
                : "bg-gradient-to-br from-red-500 to-rose-600 text-white"
            }`}
            style={{ minWidth: "320px", maxWidth: "420px", animation: "slideInUp 0.4s cubic-bezier(0.16,1,0.3,1)" }}
            role="alert"
          >
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
              {toast.type === "success" ? (
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold leading-snug">
                {toast.type === "success" ? "Submission Successful" : "Submission Failed"}
              </p>
              <p className="mt-0.5 text-xs font-medium text-white/80 leading-relaxed">
                {toast.message}
              </p>
              {toast.type === "success" && (
                <div className="mt-2.5 h-0.5 w-full rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-white/60"
                    style={{ animation: "shrinkBar 3.5s linear forwards" }}
                  />
                </div>
              )}
            </div>

            <button
              onClick={() => setToast(null)}
              className="mt-0.5 shrink-0 rounded-lg p-1 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Dismiss"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
      </div>

      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shrinkBar {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </>
  );
}

export default function WipCreateWizardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 font-sans">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-xs font-semibold">Loading Wizard Page...</p>
          </div>
        </div>
      }
    >
      <WipCreateContent />
    </Suspense>
  );
}
