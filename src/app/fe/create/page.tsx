"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import { DocumentItem, getDocuments, addDocument, updateDocumentStatus } from "../../../utils/documentStore";
import { supabase, isSupabaseConfigured } from "../../../utils/supabaseClient";
import { getCurrentUser, getRoleDetails } from "../../../utils/userStore";

function FeCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);

  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string; visible: boolean } | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [existingDoc, setExistingDoc] = useState<DocumentItem | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message, visible: true });
    if (type === "success") {
      setTimeout(() => setToast(null), 3500);
    }
  };

  // Form states
  const [company, setCompany] = useState("");
  const [projectName, setProjectName] = useState("");
  const [location, setLocation] = useState("");
  const [verificationDate, setVerificationDate] = useState("");
  const [evaluator, setEvaluator] = useState("");
  
  const [totalTemuan, setTotalTemuan] = useState("");
  const [statusTemuan, setStatusTemuan] = useState("Closed");
  const [hseScore, setHseScore] = useState("");
  const [rekomendasiClose, setRekomendasiClose] = useState("");

  useEffect(() => {
    setIsMounted(true);
    getDocuments().then(setDocuments);

    const loadData = async () => {
      const docNo = searchParams.get("no");
      
      // Auto pre-fill from currently logged-in user profile
      const user = getCurrentUser();
      if (user) {
        setEvaluator(user.fullName);
      }
      
      // Auto pre-fill Tanggal Verifikasi to today's date
      const today = new Date().toISOString().split('T')[0];
      setVerificationDate(today);

      if (docNo) {
        const docs = await getDocuments();
        const doc = docs.find((d) => d.no.toString() === docNo);
        if (doc) setExistingDoc(doc);
        
        if (isSupabaseConfigured) {
          const { data, error } = await supabase
            .from("fe_submissions")
            .select("*")
            .eq("document_no", docNo)
            .single();
          
          if (data && !error) {
            if (data.total_temuan !== null) setTotalTemuan(data.total_temuan.toString());
            if (data.status_temuan) setStatusTemuan(data.status_temuan);
            if (data.hse_score !== null) setHseScore(data.hse_score.toString());
            if (data.rekomendasi_close) setRekomendasiClose(data.rekomendasi_close);
          }
        }
      }

      // Pre-fill from query params as fallback
      const companyParam = searchParams.get("company");
      const projectParam = searchParams.get("projectName");
      const locationParam = searchParams.get("location");
      
      if (companyParam) setCompany(companyParam);
      if (projectParam) setProjectName(projectParam);
      if (locationParam) setLocation(locationParam);
    };

    loadData();
  }, [searchParams]);

  const handleFinishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let isValid = true;
    if (formRef.current) {
      isValid = formRef.current.checkValidity();
      if (!isValid) {
        formRef.current.reportValidity();
        setIsSubmitting(false);
        return;
      }
    }

    const docNo = searchParams.get("no");
    
    try {
      let targetDocNo = docNo ? parseInt(docNo, 10) : null;
      
      if (targetDocNo && existingDoc) {
        // Update existing document status to "Done"
        await updateDocumentStatus(targetDocNo, "Done");
      } else {
        // Insert new document if no query parameter
        const dateFormatted = new Date().toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).replace(/ /g, "-");
        
        const updatedDocs = await addDocument({
          nama: projectName || "Unnamed Procurement Project",
          added: dateFormatted,
          addedDate: new Date().toISOString(),
          status: "Done",
          type: "FE",
          nilai: hseScore ? parseFloat(hseScore).toFixed(1) : "95.0",
        });
        
        targetDocNo = updatedDocs[0]?.no ?? null;
      }

      if (!targetDocNo) {
        throw new Error("Could not determine document number for FE submission.");
      }

      if (isSupabaseConfigured) {
        const { error: feError } = await supabase.from("fe_submissions").upsert(
          {
            document_no: targetDocNo,
            project_name: projectName || "Unnamed Procurement Project",
            total_temuan: totalTemuan ? parseInt(totalTemuan, 10) : 0,
            status_temuan: statusTemuan,
            hse_score: hseScore ? parseFloat(hseScore) : null,
            rekomendasi_close: rekomendasiClose,
          },
          { onConflict: 'document_no' }
        );

        if (feError) {
          throw feError;
        }
      }

      showToast("success", "Final Evaluation (FE) saved successfully! Redirecting...");
      setTimeout(() => router.push("/fe"), 2000);
    } catch (error) {
      console.error("Failed to submit FE entry:", error);
      showToast("error", "Failed to save FE submission. Please check your connection and try again.");
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
        <Sidebar currentPath="/fe/create" selectedCategory="FE" documents={documents} />

        <div className="flex flex-1 flex-col pl-72">
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Judul Pekerjaan</label>
                    <textarea
                      rows={2}
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-semibold resize-none"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Perusahaan</label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Lokasi Pekerjaan</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-semibold"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal Verifikasi</label>
                    <input
                      type="date"
                      value={verificationDate}
                      onChange={(e) => setVerificationDate(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Evaluator</label>
                    <input
                      type="text"
                      value={evaluator}
                      onChange={(e) => setEvaluator(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none cursor-not-allowed font-semibold"
                      readOnly
                    />
                  </div>
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
              <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-6 h-full">
                <div className="space-y-4 flex flex-col h-full">
                  <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Document Preview (FE)</span>
                  
                  {existingDoc?.filePath ? (
                    <div className="flex-1 w-full rounded-lg border border-slate-200 bg-white overflow-hidden shadow-inner flex items-center justify-center relative min-h-[400px]">
                      <iframe 
                        src={`/api/document?path=${encodeURIComponent(existingDoc.filePath)}`}
                        className="absolute inset-0 w-full h-full"
                        title="PDF Preview"
                      />
                    </div>
                  ) : (
                    <div className="relative border border-slate-300 rounded-lg bg-white p-6 shadow-inner aspect-[3/4] overflow-hidden flex flex-col justify-between text-slate-800 text-[8px] leading-relaxed select-none h-[500px]">
                      <div className="flex items-center justify-between border-b border-blue-900 pb-2">
                        <div className="text-left font-bold text-blue-955 text-[10px]">PERTAMINA</div>
                        <div className="text-right text-[6px] text-slate-400">No. Dok: HSE-FE-04</div>
                      </div>
                      
                      <div className="text-center font-bold text-slate-900 uppercase my-3 space-y-1">
                        <p className="text-[9px]">FINAL PERFORMANCE EVALUATION</p>
                        <p className="text-[8px] text-blue-955 font-semibold">SERTIFIKASI KINERJA KONTRAKTOR HSSE</p>
                      </div>
                      
                      <div className="flex-1 space-y-2 py-2 text-slate-650">
                        <p className="text-[7px] font-semibold">Perusahaan: {company || "N/A"}</p>
                        <p className="text-[7px] font-semibold">Judul Pekerjaan: {projectName || "N/A"}</p>
                        <p className="text-[7px] font-semibold">Lokasi: {location || "N/A"}</p>
                        <p className="text-[7px] font-semibold">Temuan audit: {totalTemuan || "0"} ({statusTemuan}).</p>
                        <p className="text-[7px] font-semibold">HSE Score: {hseScore || "0"} / 100.</p>
                        <p className="text-[7px] font-semibold">Rekomendasi: {rekomendasiClose || "[Belum diisi]"}</p>
                      </div>
                      
                      <div className="flex justify-between pt-2">
                        <div className="text-left w-24">
                          <p className="font-bold text-slate-800 text-[6px] mb-1">Tanggal Verifikasi</p>
                          <p className="text-slate-600 text-[6px]">{verificationDate || "[Tanggal]"}</p>
                        </div>
                        <div className="text-right w-24">
                          <p className="font-bold text-slate-800">Evaluator</p>
                          <div className="h-6 w-full flex items-center justify-center my-0.5 border border-dashed border-slate-200 text-slate-300 font-bold text-[6px] text-center px-1">
                            {evaluator || "Signature"}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="rounded-xl border border-slate-200 bg-white p-3 flex items-center justify-between shadow-sm mt-4">
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
                    disabled={isSubmitting}
                    className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-650 px-8 py-3 text-xs font-extrabold text-white shadow-md hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] transition-all uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Submitting..." : "Finish & Submit"}
                  </button>
                </div>
              </div>
            </div>
          </div>
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
            <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20`}>
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
