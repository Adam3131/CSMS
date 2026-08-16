"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import {
  DocumentItem,
  getDocuments,
  addDocument,
  saveDocuments,
  openDocument,
} from "../../../utils/documentStore";
import { supabase, isSupabaseConfigured } from "../../../utils/supabaseClient";
import { getCurrentUser, getRoleDetails } from "../../../utils/userStore";

function PjeCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);

  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
    visible: boolean;
  } | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  // Wizard state: 1, 2, or 3
  const [pjaStep, setPjaStep] = useState<1 | 2 | 3>(1);

  // Form states initialized dynamically
  const [vendorName, setVendorName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [pjaBidangUsaha, setPjaBidangUsaha] = useState(
    "Jasa Pelayaran & Pengangkutan Gas",
  );
  const [evaluationDate, setEvaluationDate] = useState("");
  const [evaluatorName, setEvaluatorName] = useState("");
  const [picJabatan, setPicJabatan] = useState("");
  const [lokasiPekerjaan, setLokasiPekerjaan] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  // Sync params on mount
  useEffect(() => {
    setIsMounted(true);
    getDocuments().then(async (docs) => {
      setDocuments(docs);

      const docNo = searchParams.get("no");
      if (docNo) {
        const targetNo = parseInt(docNo, 10);
        const doc = docs.find((d) => d.no === targetNo);
        if (doc) {
          setSelectedDoc(doc);
          setProjectName(doc.nama);

          if (doc.filePath) {
            openDocument(doc.filePath).then((url) => {
              if (url) {
                setPdfPreviewUrl(url);
              }
            });
          }

          if (isSupabaseConfigured) {
            try {
              const { data, error } = await supabase
                .from("pja_submissions")
                .select("*")
                .eq("document_no", targetNo)
                .single();
              if (data && !error) {
                setVendorName(data.vendor_name || "");
                setProjectName(data.project_name || doc.nama);
                setPjaBidangUsaha(
                  data.bidang_usaha || "Jasa Pelayaran & Pengangkutan Gas",
                );
                setEvaluationDate(
                  data.evaluation_date ||
                    new Date().toISOString().split("T")[0],
                );
                setEvaluatorName(data.evaluator_name || "");
                setPicJabatan(data.pic_jabatan || "");
                setLokasiPekerjaan(data.lokasi_pekerjaan || "");
                if (data.answers) setPjaAnswers(data.answers);
                if (data.notes) setPjaNotes(data.notes);
                if (data.keterangan) setPjaKeteranganP7(data.keterangan);
                if (data.due_date) {
                  const parts = data.due_date.split("-");
                  if (parts.length === 3) {
                    setPjaDueDate(`${parts[2]}/${parts[1]}/${parts[0]}`);
                  }
                }
              } else {
                // If doc found but no sub-record saved yet
                const companyParam = searchParams.get("company");
                if (companyParam) setVendorName(companyParam);
                const locationParam = searchParams.get("location");
                if (locationParam) setLokasiPekerjaan(locationParam);
                setEvaluationDate(new Date().toISOString().split("T")[0]);

                const user = getCurrentUser();
                if (user) {
                  setEvaluatorName(user.fullName);
                  const details = getRoleDetails(user.role);
                  setPicJabatan(
                    details.position || "Environmental & HSSE Governance",
                  );
                } else {
                  setEvaluatorName("PUTRI FATIMA SUNNIA");
                  setPicJabatan("Environmental & HSSE Governance");
                }
              }
            } catch (err) {
              console.error("Failed to load PJA details:", err);
            }
          } else {
            // Local fallback
            const companyParam = searchParams.get("company");
            if (companyParam) setVendorName(companyParam);
            const locationParam = searchParams.get("location");
            if (locationParam) setLokasiPekerjaan(locationParam);
            setEvaluationDate(new Date().toISOString().split("T")[0]);

            const user = getCurrentUser();
            if (user) {
              setEvaluatorName(user.fullName);
              const details = getRoleDetails(user.role);
              setPicJabatan(
                details.position || "Environmental & HSSE Governance",
              );
            } else {
              setEvaluatorName("PUTRI FATIMA SUNNIA");
              setPicJabatan("Environmental & HSSE Governance");
            }
          }
        }
      } else {
        // Brand new creation
        const companyParam = searchParams.get("company");
        const projectParam = searchParams.get("projectName");
        const locationParam = searchParams.get("location");

        if (companyParam) setVendorName(companyParam);
        if (projectParam) setProjectName(projectParam);
        if (locationParam) setLokasiPekerjaan(locationParam);

        setEvaluationDate(new Date().toISOString().split("T")[0]);

        const user = getCurrentUser();
        if (user) {
          setEvaluatorName(user.fullName);
          const details = getRoleDetails(user.role);
          setPicJabatan(details.position || "Environmental & HSSE Governance");
        } else {
          setEvaluatorName("PUTRI FATIMA SUNNIA");
          setPicJabatan("Environmental & HSSE Governance");
        }
      }
    });
  }, [searchParams]);

  // Scoring matrix answers
  const [pjaAnswers, setPjaAnswers] = useState<
    Record<string, "YES" | "NO" | "NO_NEED" | null>
  >({
    scoreP1_1: null,
    scoreP1_2: null,
    scoreP1_3: null,
    scoreP1_4: null,
    scoreP7_1: null,
    scoreP7_2: null,
  });

  // Scoring matrix notes
  const [pjaNotes, setPjaNotes] = useState<Record<string, string>>({
    scoreP1_1: "",
    scoreP1_2: "",
    scoreP1_3: "",
    scoreP1_4: "",
    scoreP7_1: "",
    scoreP7_2: "",
  });

  const [pjaDueDate, setPjaDueDate] = useState("");
  const [pjaKeteranganP7, setPjaKeteranganP7] = useState("1. \n2. ");

  const handlePjaAnswerChange = (
    key: string,
    val: "YES" | "NO" | "NO_NEED" | null,
  ) => {
    setPjaAnswers((prev) => ({ ...prev, [key]: val }));
  };

  const handlePjaNoteChange = (key: string, val: string) => {
    setPjaNotes((prev) => ({ ...prev, [key]: val }));
  };

  // Proses 1 Totals
  const pjaP1Totals = useMemo(() => {
    let yes = 0;
    let no = 0;
    let noNeed = 0;
    const keys = ["scoreP1_1", "scoreP1_2", "scoreP1_3", "scoreP1_4"];
    keys.forEach((key) => {
      if (pjaAnswers[key] === "YES") yes++;
      else if (pjaAnswers[key] === "NO") no++;
      else if (pjaAnswers[key] === "NO_NEED") noNeed++;
    });
    return { yes, no, noNeed };
  }, [pjaAnswers]);

  // Proses 7 Totals
  const pjaP7Totals = useMemo(() => {
    let yes = 0;
    let no = 0;
    let noNeed = 0;
    const keys = ["scoreP7_1", "scoreP7_2"];
    keys.forEach((key) => {
      if (pjaAnswers[key] === "YES") yes++;
      else if (pjaAnswers[key] === "NO") no++;
      else if (pjaAnswers[key] === "NO_NEED") noNeed++;
    });

    const denominator = 2 - noNeed;
    const yesPct = denominator > 0 ? Math.round((yes / denominator) * 100) : 0;
    const noPct = denominator > 0 ? Math.round((no / denominator) * 100) : 0;

    return { yes, no, noNeed, yesPct, noPct };
  }, [pjaAnswers]);

  // Total Semua Proses Score
  const pjaTotalSemuaProses = useMemo(() => {
    let yesCount = 0;
    Object.values(pjaAnswers).forEach((val) => {
      if (val === "YES") yesCount++;
    });
    return yesCount;
  }, [pjaAnswers]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message, visible: true });
    if (type === "success") {
      setTimeout(() => setToast(null), 3500);
    }
  };

  const handleFinishSubmit = async () => {
    setIsSubmitting(true);
    setToast(null);

    try {
      const dateFormatted = new Date()
        .toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .replace(/ /g, "-");

      const calculatedScore = pjaTotalSemuaProses.toFixed(2);
      const docNo = searchParams.get("no");
      let newDocNo: number | null = null;

      if (docNo) {
        // Edit / Update existing document
        const targetNo = parseInt(docNo, 10);
        newDocNo = targetNo;

        const docs = await getDocuments();
        const updated = docs.map((d) => {
          if (d.no === targetNo) {
            return {
              ...d,
              status: "Done" as const,
              nilai: calculatedScore,
            };
          }
          return d;
        });
        saveDocuments(updated);

        if (isSupabaseConfigured) {
          await supabase
            .from("documents")
            .update({
              status: "Done",
              nilai: calculatedScore,
            })
            .eq("no", targetNo);
        }
      } else {
        // Brand new insert
        const updatedDocs = await addDocument({
          nama: projectName,
          added: dateFormatted,
          addedDate: new Date().toISOString(),
          status: "Done",
          type: "PJA",
          nilai: calculatedScore,
        });
        newDocNo = updatedDocs[0]?.no ?? null;
      }

      // 2. Parse due_date from DD/MM/YYYY → YYYY-MM-DD for Supabase date type
      let parsedDueDate: string | null = null;
      if (pjaDueDate) {
        const parts = pjaDueDate.split("/");
        if (parts.length === 3) {
          parsedDueDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }

      // 3. Upsert detailed record into pja_submissions
      if (isSupabaseConfigured) {
        const payload = {
          document_no: newDocNo,
          vendor_name: vendorName,
          project_name: projectName,
          bidang_usaha: pjaBidangUsaha,
          evaluation_date: evaluationDate || null,
          evaluator_name: evaluatorName,
          pic_jabatan: picJabatan,
          lokasi_pekerjaan: lokasiPekerjaan,
          answers: pjaAnswers,
          notes: pjaNotes,
          due_date: parsedDueDate,
          keterangan: pjaKeteranganP7,
        };

        const { error: pjaError } = await supabase
          .from("pja_submissions")
          .upsert(payload, { onConflict: "document_no" });

        if (pjaError) throw new Error(pjaError.message);
      }

      showToast("success", "PJA submitted successfully! Redirecting...");
      setTimeout(() => router.push("/pje"), 2000);
    } catch (err) {
      console.error("Failed to submit PJA:", err);
      showToast(
        "error",
        "Failed to save document. Please check your connection and try again.",
      );
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
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* 1. LEFT SIDEBAR */}
      <Sidebar
        currentPath="/pje/create"
        selectedCategory="PJA"
        documents={documents}
      />

      {/* 2. MAIN CONTENT PANEL */}
      <div className="flex flex-1 flex-col pl-72">
        {/* Sticky Header */}
        <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-200/60 bg-white/80 px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-tight text-slate-800">
              Create Pre Job Assessment (PJA)
            </h1>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold text-slate-500">
              Step {pjaStep} of 3
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-800">
                PUTRI FATIMA SUNNIA
              </p>
              <p className="text-[10px] font-medium text-slate-400">
                Environmental & HSSE Governance
              </p>
            </div>
            <div className="h-9 w-9 rounded-full border border-slate-200 bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-xs shadow-inner">
              PS
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 space-y-6 max-w-7xl w-full mx-auto animate-fade-in">
          {/* Breadcrumbs for wizard steps */}
          <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-slate-200/60 shadow-sm select-none">
            <div className="flex items-center gap-6 text-xs font-bold">
              {[
                { step: 1, label: "General Information" },
                { step: 2, label: "Proses 1: Leadership" },
                { step: 3, label: "Proses 7: Assurance" },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${
                      pjaStep === s.step
                        ? "bg-blue-600 text-white shadow-sm"
                        : pjaStep > s.step
                          ? "bg-emerald-100 text-emerald-700 font-bold"
                          : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {pjaStep > s.step ? "✓" : s.step}
                  </span>
                  <span
                    className={
                      pjaStep === s.step ? "text-slate-800" : "text-slate-400"
                    }
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-xs font-semibold text-slate-400">
              Last edit: 22 February 2026
            </div>
          </div>

          {/* STEP 1: General Information & PDF Preview */}
          {pjaStep === 1 && (
            <div className="rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <form
                  ref={formRef}
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (formRef.current?.checkValidity()) {
                      setPjaStep(2);
                    } else {
                      formRef.current?.reportValidity();
                    }
                  }}
                  className="space-y-5"
                  noValidate
                >
                  <div>
                    <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
                      PJA General Form
                    </h3>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="pja-vendor"
                      className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                    >
                      Nama Perusahaan
                    </label>
                    <input
                      type="text"
                      id="pja-vendor"
                      required
                      placeholder="Masukkan nama perusahaan..."
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-800 outline-none shadow-sm transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="pja-bidang"
                      className="block text-[10px] font-bold text-slate-405 uppercase tracking-wider"
                    >
                      Bidang Usaha
                    </label>
                    <input
                      type="text"
                      id="pja-bidang"
                      required
                      placeholder="Masukkan bidang usaha..."
                      value={pjaBidangUsaha}
                      onChange={(e) => setPjaBidangUsaha(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-800 outline-none shadow-sm transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="pja-project"
                      className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                    >
                      Judul Pekerjaan
                    </label>
                    <input
                      type="text"
                      id="pja-project"
                      required
                      placeholder="Masukkan judul pekerjaan..."
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-800 outline-none shadow-sm transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="pja-tgl"
                      className="block text-[10px] font-bold text-slate-405 uppercase tracking-wider"
                    >
                      Tanggal Verifikasi
                    </label>
                    <input
                      type="date"
                      id="pja-tgl"
                      required
                      value={evaluationDate}
                      onChange={(e) => setEvaluationDate(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-800 outline-none shadow-sm transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="pja-evaluator"
                      className="block text-[10px] font-bold text-slate-405 uppercase tracking-wider"
                    >
                      Nama Evaluator
                    </label>
                    <input
                      type="text"
                      id="pja-evaluator"
                      required
                      placeholder="Masukkan nama evaluator..."
                      value={evaluatorName}
                      onChange={(e) => setEvaluatorName(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-800 outline-none shadow-sm transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="pja-pic"
                      className="block text-[10px] font-bold text-slate-405 uppercase tracking-wider"
                    >
                      PIC - Jabatan
                    </label>
                    <input
                      type="text"
                      id="pja-pic"
                      required
                      placeholder="Masukkan jabatan PIC..."
                      value={picJabatan}
                      onChange={(e) => setPicJabatan(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-800 outline-none shadow-sm transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="pja-lokasi"
                      className="block text-[10px] font-bold text-slate-405 uppercase tracking-wider"
                    >
                      Lokasi Pekerjaan
                    </label>
                    <input
                      type="text"
                      id="pja-lokasi"
                      required
                      placeholder="Masukkan lokasi pekerjaan..."
                      value={lokasiPekerjaan}
                      onChange={(e) => setLokasiPekerjaan(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-800 outline-none shadow-sm transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 font-semibold"
                    />
                  </div>
                </form>

                {/* Right side: PDF Preview */}
                <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-6">
                  <div className="space-y-4">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Document Preview (PJA)
                    </span>
                    <div className="relative border border-slate-300 rounded-lg bg-white shadow-inner aspect-[3/4] overflow-hidden flex flex-col justify-between select-none">
                      {pdfPreviewUrl ? (
                        <iframe
                          src={pdfPreviewUrl}
                          className="w-full h-full border-0"
                          title="Document PDF Preview"
                        />
                      ) : (
                        <div className="p-6 h-full flex flex-col justify-between text-slate-850 text-[8px] leading-relaxed">
                          <div className="flex items-center justify-between border-b border-blue-900 pb-2">
                            <div className="text-left font-bold text-blue-900 text-[10px]">
                              PERTAMINA
                            </div>
                            <div className="text-right text-[6px] text-slate-400">
                              No. Dok: HSE-PJA-02
                            </div>
                          </div>
                          <div className="text-center font-bold text-slate-900 uppercase my-3 space-y-1">
                            <p className="text-[9px]">Surat Keputusan PJA</p>
                            <p className="text-[7px] text-slate-500 font-semibold">
                              No. Kpts - PJA - 12 / 2026
                            </p>
                            <p className="text-[8px] tracking-tight text-blue-950 mt-1">
                              TENTANG EVALUASI KESIAPAN PENCEGAHAN RESIKO HSSE
                              PADA PRE JOB ASSESSMENT
                            </p>
                          </div>
                          <div className="flex-1 space-y-2 py-2 text-slate-600">
                            <p className="font-semibold text-slate-800">
                              DIREKTUR UTAMA PT PERTAMINA (PERSERO),
                            </p>
                            <p className="text-[7px]">
                              PJA wajib dilaksanakan secara seksama untuk setiap
                              kontrak bernilai tinggi guna memitigasi
                              keselamatan kerja pelaut dan operasional
                              pengangkutan gas di lapangan.
                            </p>
                          </div>
                          <div className="flex justify-end pt-2">
                            <div className="text-right w-24">
                              <p>Jakarta, 2026</p>
                              <p className="font-bold text-slate-800">
                                Direktur Utama
                              </p>
                              <div className="h-6 w-full flex items-center justify-center my-0.5 border border-dashed border-slate-200 text-slate-300 font-bold">
                                Signature
                              </div>
                              <p className="font-bold text-slate-800 underline">
                                Nicke Widyawati
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-700 font-bold text-xs shrink-0">
                          PDF
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {selectedDoc?.fileName ||
                              "Pre Job Assessment Checklist.pdf"}
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold">
                            {selectedDoc?.fileName ? "Database File" : "1.2 MB"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          if (selectedDoc?.filePath) {
                            const url = await openDocument(
                              selectedDoc.filePath,
                            );
                            if (url) {
                              window.open(url, "_blank");
                            } else {
                              alert(
                                "Failed to open file: File path not accessible.",
                              );
                            }
                          } else {
                            alert("Simulating PDF full view...");
                          }
                        }}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        View File
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-6 border-t border-slate-200 pt-4">
                    <button
                      type="button"
                      onClick={() => router.push("/pje")}
                      className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-55 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (lokasiPekerjaan && picJabatan && pjaBidangUsaha) {
                          setPjaStep(2);
                        } else {
                          formRef.current?.reportValidity();
                        }
                      }}
                      className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-650 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:from-blue-500 hover:to-indigo-500 transition-all active:scale-[0.98]"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Matrix Questionnaires (Proses 1) */}
          {pjaStep === 2 && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Vendor Name:
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={vendorName}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 outline-none cursor-default"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Project Name:
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={projectName}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 outline-none cursor-default"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Evaluation Date:
                  </label>
                  <input
                    type="date"
                    value={evaluationDate}
                    onChange={(e) => setEvaluationDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Evaluator:
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={evaluatorName}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 outline-none cursor-default"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm space-y-6">
                <div className="space-y-4">
                  <div className="inline-flex rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-800 border border-slate-200 select-none">
                    Proses 1 : Kepemimpinan dan Akuntabilitas
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-700">
                      1. Keterlibatan Manajemen
                    </p>
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                      <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                        <thead className="bg-slate-50 font-bold text-slate-500">
                          <tr>
                            <th scope="col" className="px-4 py-3">
                              KOMPONEN PENILAIAN HSE PLAN
                            </th>
                            <th
                              scope="col"
                              className="px-2 py-3 w-16 text-center"
                            >
                              YES
                            </th>
                            <th
                              scope="col"
                              className="px-2 py-3 w-16 text-center"
                            >
                              NO
                            </th>
                            <th
                              scope="col"
                              className="px-2 py-3 w-20 text-center"
                            >
                              NO NEED
                            </th>
                            <th scope="col" className="px-4 py-3 w-64">
                              Keterangan
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-700">
                          {[
                            {
                              key: "scoreP1_1",
                              name: "Apakah Program HSSE yang melibatkan manajemen (MWT, Rapat HSSE, mempromosikan budaya HSSE, Penerapan Corporate Life Saving Rules (CLSR) Pertamina, Pengamatan Keselamatan Kerja, dll) untuk pelaksanaan pekerjaan kontrak telah tersedia dan ditandatangani oleh Manajemen Pelaksana Kontrak?",
                            },
                            {
                              key: "scoreP1_2",
                              name: "Apakah Manajemen Pelaksana Kontrak telah terlibat dalam Kick Off meeting yang membahas kesiapan pelaksanaan HSSE Plan sebelum pekerjaan dimulai?",
                            },
                            {
                              key: "scoreP1_3",
                              name: "Apakah HSSE Plan yang sudah disetujui oleh FPP Pertamina telah ditandatangani oleh Manajemen Pelaksana Kontrak yang berwenang?",
                            },
                          ].map((row) => (
                            <tr key={row.key} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3.5 font-semibold text-slate-800 leading-relaxed max-w-sm">
                                {row.name}
                              </td>
                              <td className="px-2 py-3.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={pjaAnswers[row.key] === "YES"}
                                  onChange={() =>
                                    handlePjaAnswerChange(
                                      row.key,
                                      pjaAnswers[row.key] === "YES"
                                        ? null
                                        : "YES",
                                    )
                                  }
                                  className="h-4 w-4 rounded text-blue-650 cursor-pointer"
                                />
                              </td>
                              <td className="px-2 py-3.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={pjaAnswers[row.key] === "NO"}
                                  onChange={() =>
                                    handlePjaAnswerChange(
                                      row.key,
                                      pjaAnswers[row.key] === "NO"
                                        ? null
                                        : "NO",
                                    )
                                  }
                                  className="h-4 w-4 rounded text-blue-650 cursor-pointer"
                                />
                              </td>
                              <td className="px-2 py-3.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={pjaAnswers[row.key] === "NO_NEED"}
                                  onChange={() =>
                                    handlePjaAnswerChange(
                                      row.key,
                                      pjaAnswers[row.key] === "NO_NEED"
                                        ? null
                                        : "NO_NEED",
                                    )
                                  }
                                  className="h-4 w-4 rounded text-blue-650 cursor-pointer"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="text"
                                  placeholder="Keterangan..."
                                  value={pjaNotes[row.key]}
                                  onChange={(e) =>
                                    handlePjaNoteChange(row.key, e.target.value)
                                  }
                                  className="w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 outline-none text-xs py-1"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-700">
                      2. Penghargaan dan Sanksi terkait Aspek HSSE
                    </p>
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                      <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                        <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-700">
                          {[
                            {
                              key: "scoreP1_4",
                              name: "Pemberlakuan sistem Reward terhadap kinerja HSSE yang baik/ upaya pro aktif",
                            },
                          ].map((row) => (
                            <tr key={row.key} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3.5 font-semibold text-slate-800 leading-relaxed max-w-sm">
                                {row.name}
                              </td>
                              <td className="px-2 py-3.5 w-16 text-center">
                                <input
                                  type="checkbox"
                                  checked={pjaAnswers[row.key] === "YES"}
                                  onChange={() =>
                                    handlePjaAnswerChange(
                                      row.key,
                                      pjaAnswers[row.key] === "YES"
                                        ? null
                                        : "YES",
                                    )
                                  }
                                  className="h-4 w-4 rounded text-blue-650 cursor-pointer"
                                />
                              </td>
                              <td className="px-2 py-3.5 w-16 text-center">
                                <input
                                  type="checkbox"
                                  checked={pjaAnswers[row.key] === "NO"}
                                  onChange={() =>
                                    handlePjaAnswerChange(
                                      row.key,
                                      pjaAnswers[row.key] === "NO"
                                        ? null
                                        : "NO",
                                    )
                                  }
                                  className="h-4 w-4 rounded text-blue-650 cursor-pointer"
                                />
                              </td>
                              <td className="px-2 py-3.5 w-20 text-center">
                                <input
                                  type="checkbox"
                                  checked={pjaAnswers[row.key] === "NO_NEED"}
                                  onChange={() =>
                                    handlePjaAnswerChange(
                                      row.key,
                                      pjaAnswers[row.key] === "NO_NEED"
                                        ? null
                                        : "NO_NEED",
                                    )
                                  }
                                  className="h-4 w-4 rounded text-blue-650 cursor-pointer"
                                />
                              </td>
                              <td className="px-4 py-2 w-64">
                                <input
                                  type="text"
                                  placeholder="Keterangan..."
                                  value={pjaNotes[row.key]}
                                  onChange={(e) =>
                                    handlePjaNoteChange(row.key, e.target.value)
                                  }
                                  className="w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 outline-none text-xs py-1"
                                />
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-slate-50 font-bold">
                            <td className="px-4 py-3.5 text-right uppercase text-slate-500">
                              Total
                            </td>
                            <td className="px-2 py-3.5 text-center text-slate-900">
                              {pjaP1Totals.yes.toFixed(2)}
                            </td>
                            <td className="px-2 py-3.5 text-center text-slate-900">
                              {pjaP1Totals.no.toFixed(2)}
                            </td>
                            <td className="px-2 py-3.5 text-center text-slate-900">
                              {pjaP1Totals.noNeed.toFixed(2)}
                            </td>
                            <td className="px-4 py-3.5"></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => setPjaStep(1)}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 shadow-sm active:scale-[0.98]"
                  >
                    &lt; Prev
                  </button>
                  <div className="text-xs text-slate-400 font-bold">
                    Total Score:{" "}
                    <span className="text-blue-700 font-extrabold">
                      {pjaTotalSemuaProses.toFixed(2)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPjaStep(3)}
                    className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-650 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] transition-all"
                  >
                    Next &gt;
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Proses 7 Jaminan, Due Date, Keterangan, and Finish */}
          {pjaStep === 3 && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-1 gap-5 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm md:grid-cols-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Vendor Name:
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={vendorName}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 outline-none cursor-default"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Project Name:
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={projectName}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 outline-none cursor-default"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Evaluation Date:
                  </label>
                  <input
                    type="date"
                    value={evaluationDate}
                    onChange={(e) => setEvaluationDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Evaluator:
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={evaluatorName}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 outline-none cursor-default"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm space-y-6">
                <div className="space-y-4">
                  <div className="inline-flex rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-800 border border-slate-200 select-none uppercase">
                    PROSES 7. JAMINAN : PEMANTAUAN, PENGUKURAN DAN AUDIT
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-700">
                      1. AUDIT HSSE
                    </p>
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                      <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                        <thead className="bg-slate-50 font-bold text-slate-500">
                          <tr>
                            <th scope="col" className="px-4 py-3">
                              KOMPONEN PENILAIAN HSE PLAN
                            </th>
                            <th
                              scope="col"
                              className="px-2 py-3 w-16 text-center"
                            >
                              YES
                            </th>
                            <th
                              scope="col"
                              className="px-2 py-3 w-16 text-center"
                            >
                              NO
                            </th>
                            <th
                              scope="col"
                              className="px-2 py-3 w-20 text-center"
                            >
                              NO NEED
                            </th>
                            <th scope="col" className="px-4 py-3 w-64">
                              Keterangan
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-700">
                          {[
                            {
                              key: "scoreP7_1",
                              name: "Apakah Pelaksana Kontrak telah menyusun dan mengesahkan program tinjauan/ review terhadap implementasi HSSE Plan selama pelaksanaan pekerjaan kontrak?",
                            },
                            {
                              key: "scoreP7_2",
                              name: "Apakah periode pelaksanaan tinjauan/ review terhadap implementasi HSSE Plan telah ditetapkan?",
                            },
                          ].map((row) => (
                            <tr key={row.key} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3.5 font-semibold text-slate-800 leading-relaxed max-w-sm">
                                {row.name}
                              </td>
                              <td className="px-2 py-3.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={pjaAnswers[row.key] === "YES"}
                                  onChange={() =>
                                    handlePjaAnswerChange(
                                      row.key,
                                      pjaAnswers[row.key] === "YES"
                                        ? null
                                        : "YES",
                                    )
                                  }
                                  className="h-4 w-4 rounded text-blue-650 cursor-pointer"
                                />
                              </td>
                              <td className="px-2 py-3.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={pjaAnswers[row.key] === "NO"}
                                  onChange={() =>
                                    handlePjaAnswerChange(
                                      row.key,
                                      pjaAnswers[row.key] === "NO"
                                        ? null
                                        : "NO",
                                    )
                                  }
                                  className="h-4 w-4 rounded text-blue-650 cursor-pointer"
                                />
                              </td>
                              <td className="px-2 py-3.5 text-center">
                                <input
                                  type="checkbox"
                                  checked={pjaAnswers[row.key] === "NO_NEED"}
                                  onChange={() =>
                                    handlePjaAnswerChange(
                                      row.key,
                                      pjaAnswers[row.key] === "NO_NEED"
                                        ? null
                                        : "NO_NEED",
                                    )
                                  }
                                  className="h-4 w-4 rounded text-blue-650 cursor-pointer"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="text"
                                  placeholder="Keterangan..."
                                  value={pjaNotes[row.key]}
                                  onChange={(e) =>
                                    handlePjaNoteChange(row.key, e.target.value)
                                  }
                                  className="w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 outline-none text-xs py-1"
                                />
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-slate-50 font-bold">
                            <td className="px-4 py-3.5 text-right uppercase text-slate-500">
                              Total
                            </td>
                            <td className="px-2 py-3.5 text-center text-slate-900">
                              {pjaP7Totals.yes.toFixed(2)}
                            </td>
                            <td className="px-2 py-3.5 text-center text-slate-900">
                              {pjaP7Totals.no.toFixed(2)}
                            </td>
                            <td className="px-2 py-3.5 text-center text-slate-900"></td>
                            <td className="px-4 py-3.5"></td>
                          </tr>
                          <tr className="bg-slate-50 font-bold">
                            <td className="px-4 py-3.5 text-right uppercase text-slate-500">
                              % PENCAPAIAN TOTAL NILAI PROSES
                            </td>
                            <td className="px-2 py-3.5 text-center text-slate-900">
                              {pjaP7Totals.yesPct}%
                            </td>
                            <td className="px-2 py-3.5 text-center text-slate-900">
                              {pjaP7Totals.noPct}%
                            </td>
                            <td className="px-2 py-3.5 text-center text-slate-900"></td>
                            <td className="px-4 py-3.5"></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Due Date & Keterangan Card */}
                <div className="overflow-x-auto rounded-xl border border-slate-200 mt-4">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-xs font-semibold">
                    <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
                      <tr>
                        <td className="px-4 py-3.5 text-slate-800 bg-slate-50 w-48 uppercase tracking-wider">
                          Due Date
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            placeholder="DD/MM/YYYY"
                            value={pjaDueDate}
                            onChange={(e) => setPjaDueDate(e.target.value)}
                            className="w-full bg-transparent outline-none text-xs py-1 font-semibold text-slate-800"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3.5 text-slate-800 bg-slate-50 w-48 uppercase tracking-wider align-top pt-3">
                          Rekomendasi
                        </td>
                        <td className="px-4 py-2">
                          <textarea
                            rows={4}
                            value={pjaKeteranganP7}
                            onChange={(e) => setPjaKeteranganP7(e.target.value)}
                            className="w-full bg-transparent outline-none text-xs py-1 resize-none font-medium text-slate-700 leading-relaxed"
                            placeholder="1.&#10;2."
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => setPjaStep(2)}
                    disabled={isSubmitting}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                  >
                    &lt; Prev
                  </button>
                  <div className="text-xs text-slate-400 font-bold">
                    Total Score:{" "}
                    <span className="text-blue-700 font-extrabold">
                      {pjaTotalSemuaProses.toFixed(2)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleFinishSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-650 px-8 py-3 text-xs font-extrabold text-white shadow-md hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] transition-all uppercase tracking-wider disabled:opacity-60 disabled:pointer-events-none"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="h-4 w-4 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Saving...
                      </>
                    ) : (
                      "Finish & Submit"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Toast Notification ── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-start gap-4 rounded-2xl px-5 py-4 shadow-2xl transition-all duration-500
            ${
              toast.type === "success"
                ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
                : "bg-gradient-to-br from-red-500 to-rose-600 text-white"
            }`}
          style={{
            minWidth: "320px",
            maxWidth: "420px",
            animation: "slideInUp 0.4s cubic-bezier(0.16,1,0.3,1)",
          }}
          role="alert"
        >
          {/* Icon */}
          <div
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              toast.type === "success" ? "bg-white/20" : "bg-white/20"
            }`}
          >
            {toast.type === "success" ? (
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
            )}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold leading-snug">
              {toast.type === "success"
                ? "Submission Successful"
                : "Submission Failed"}
            </p>
            <p className="mt-0.5 text-xs font-medium text-white/80 leading-relaxed">
              {toast.message}
            </p>
            {/* Progress bar for success */}
            {toast.type === "success" && (
              <div className="mt-2.5 h-0.5 w-full rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white/60"
                  style={{ animation: "shrinkBar 3.5s linear forwards" }}
                />
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={() => setToast(null)}
            className="mt-0.5 shrink-0 rounded-lg p-1 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Dismiss"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

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
    </div>
  );
}

export default function PjaCreateWizardPage() {
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
      <PjeCreateContent />
    </Suspense>
  );
}
