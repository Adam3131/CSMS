"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import { DocumentItem, getDocuments, addDocument } from "../../../utils/documentStore";

function FeCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);

  const [isMounted, setIsMounted] = useState(false);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  // Form states prefilled from searchParams or defaults
  const [projectName, setProjectName] = useState("");
  const [totalTemuan, setTotalTemuan] = useState("");
  const [statusTemuan, setStatusTemuan] = useState("Closed");
  const [hseScore, setHseScore] = useState("");
  const [rekomendasiClose, setRekomendasiClose] = useState("");

  useEffect(() => {
    setIsMounted(true);
    getDocuments().then(setDocuments);

    const projectParam = searchParams.get("projectName");
    const nilaiParam = searchParams.get("nilai");
    const feedbackParam = searchParams.get("feedback");

    if (projectParam) setProjectName(projectParam);
    if (nilaiParam) setHseScore(nilaiParam);
    if (feedbackParam) setRekomendasiClose(feedbackParam);
  }, [searchParams]);

  const handleFinishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      year: "numeric",
    }).replace(/ /g, "-");

    await addDocument({
      nama: projectName || "Unnamed Procurement Project",
      added: dateFormatted,
      addedDate: new Date().toISOString(),
      status: "Done",
      type: "FE",
      nilai: hseScore ? parseFloat(hseScore).toFixed(1) : "95.0"
    });

    alert("Final Evaluation (FE) document created successfully!");
    router.push("/fe");
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
      <Sidebar currentPath="/fe/create" selectedCategory="FE" documents={documents} />

      {/* 2. MAIN CONTENT PANEL */}
      <div className="flex flex-1 flex-col pl-72">
        {/* Sticky Header */}
        <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-200/60 bg-white/80 px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-tight text-slate-800">
              Create Final Evaluation (FE)
            </h1>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold text-slate-500">
              Form Setup
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
          <div className="rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Form Input fields */}
              <form ref={formRef} onSubmit={handleFinishSubmit} className="space-y-5" noValidate>
                <div>
                  <h3 className="text-lg font-bold text-slate-905 border-b border-slate-100 pb-3">Create Final Evaluation (FE)</h3>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Judul Pekerjaan</label>
                  <textarea
                    readOnly
                    rows={2}
                    value={projectName}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none cursor-not-allowed font-semibold resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="temuan" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Total Temuan Audit</label>
                    <input
                      type="number"
                      id="temuan"
                      required
                      min="0"
                      placeholder="0"
                      value={totalTemuan}
                      onChange={(e) => setTotalTemuan(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="status-temuan" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Status Temuan Akhir</label>
                    <select
                      id="status-temuan"
                      value={statusTemuan}
                      onChange={(e) => setStatusTemuan(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-semibold cursor-pointer"
                    >
                      <option value="Closed">Closed / Diselesaikan</option>
                      <option value="Open">Open / Terbuka</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="score" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Skor Kinerja Akhir Kontraktor (HSE Score 1-100)</label>
                  <input
                    type="number"
                    id="score"
                    required
                    min="1"
                    max="100"
                    placeholder="Masukkan nilai evaluasi (e.g. 92)..."
                    value={hseScore}
                    onChange={(e) => setHseScore(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="rekomendasi" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Rekomendasi Penutupan Kontrak</label>
                  <textarea
                    id="rekomendasi"
                    required
                    rows={3}
                    placeholder="Berikan catatan rekomendasi penutupan audit administrasi..."
                    value={rekomendasiClose}
                    onChange={(e) => setRekomendasiClose(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-semibold leading-relaxed"
                  />
                </div>
              </form>

              {/* Document Preview panel */}
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
                  <button
                    type="button"
                    onClick={() => router.push("/fe")}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-650 transition-colors hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={handleFinishSubmit}
                    className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-650 px-8 py-3 text-xs font-extrabold text-white shadow-md hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] transition-all uppercase tracking-wider"
                  >
                    Finish & Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function FeCreateWizardPage() {
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
      <FeCreateContent />
    </Suspense>
  );
}
