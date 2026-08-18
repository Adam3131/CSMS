"use client";

import React, { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../utils/supabaseClient";

interface ManagerPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    no: number;
    nama: string;
    type: "HSE Plan" | "PJA" | "WIP" | "FE";
    status: string;
  } | null;
}

export default function ManagerPreviewModal({ isOpen, onClose, document }: ManagerPreviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!isOpen || !document) {
      setData(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        if (isSupabaseConfigured) {
          let tableName = "";
          if (document.type === "HSE Plan") tableName = "hse_plan_submissions";
          else if (document.type === "PJA") tableName = "pja_submissions";
          else if (document.type === "WIP") tableName = "wip_submissions";
          else if (document.type === "FE") tableName = "fe_submissions";

          const { data: record, error } = await supabase
            .from(tableName)
            .select("*")
            .eq("document_no", document.no)
            .single();

          if (!error && record) {
            setData(record);
            setLoading(false);
            return;
          }
        }

        // Fallback or Mock data if Supabase has no record or isn't configured
        const fallbackData: Record<string, any> = {
          "HSE Plan": {
            vendor_name: "PT Warna SeBahtera",
            project_name: document.nama,
            evaluation_date: new Date().toISOString().split("T")[0],
            evaluator_name: "PUTRI FATIMA SUNNIA",
            pic_jabatan: "HSSE Lead",
            lokasi_pekerjaan: "Jakarta Offshore Office",
            matrix_scores: {
              scoreP1_1: "1.00",
              scoreP1_2: "1.00",
              scoreP1_3: "0.75",
              scoreP1_4: "1.00",
              scoreP7_1: "0.75",
              scoreP7_2: "1.05"
            }
          },
          "PJA": {
            vendor_name: "PT Warna SeBahtera",
            project_name: document.nama,
            bidang_usaha: "Jasa Pelayaran & Pengangkutan Gas",
            evaluation_date: new Date().toISOString().split("T")[0],
            evaluator_name: "PUTRI FATIMA SUNNIA",
            pic_jabatan: "Environmental & HSSE Governance",
            lokasi_pekerjaan: "Main Port Jetty",
            answers: {
              scoreP1_1: "YES",
              scoreP1_2: "YES",
              scoreP1_3: "NO",
              scoreP1_4: "YES",
              scoreP7_1: "YES",
              scoreP7_2: "NO"
            },
            notes: {
              scoreP1_1: "Kebijakan K3L disahkan dan aktif.",
              scoreP1_2: "HSE Plan spesifik pekerjaan dilampirkan.",
              scoreP1_3: "HSE officer masih dalam proses rekrutmen.",
              scoreP1_4: "SOP K3L lengkap dan terdokumentasi.",
              scoreP7_1: "Tinjauan K3L berkala direncanakan.",
              scoreP7_2: "Rencana mitigasi belum mencakup resiko tumpahan minyak."
            },
            due_date: "2026-10-15",
            findings: "1. Pastikan HSE officer ditunjuk sebelum kick-off.\n2. Lengkapi mitigasi resiko tumpahan minyak.",
            recommendation: "1. Lakukan penunjukan HSE officer sebelum kick-off.\n2. Tambahkan mitigasi resiko tumpahan minyak ke check list kerja.",
            status: "open"
          },
          "WIP": {
            nama_perusahaan: "PT Warna SeBahtera",
            jenis_pekerjaan: document.nama,
            lokasi_pekerjaan: "Perairan Tuban",
            tanggal_penilaian: new Date().toISOString().split("T")[0],
            evaluator: "PUTRI FATIMA SUNNIA",
            stage: "Stage 2 - Pertengahan Pekerjaan",
            lagging_indicators: {
              row1: { target: "0", actual: "0", sanksi: "Aman" },
              row2: { target: "0", actual: "0", sanksi: "Aman" },
              row3: { target: "0", actual: "1", sanksi: "Teguran Tertulis" }
            },
            leading_indicators: {
              row1: { target: "100%", actual: "100%", sanksi: "Patuh" },
              row2: { target: "100%", actual: "80%", sanksi: "Teguran Lisan" },
              row3: { target: "100%", actual: "100%", sanksi: "Patuh" },
              row4: { target: "100%", actual: "100%", sanksi: "Patuh" },
              row5: { target: "100%", actual: "100%", sanksi: "Patuh" },
              row6: { target: "100%", actual: "100%", sanksi: "Patuh" },
              row7: { target: "100%", actual: "100%", sanksi: "Patuh" }
            },
            pja_lagging: {
              row1: { target: "0", actual: "0", sanksi: "Aman" },
              row2: { target: "0", actual: "0", sanksi: "Aman" },
              row3: { target: "0", actual: "0", sanksi: "Aman" }
            },
            pja_leading: {
              row1: { target: "100%", actual: "100%", sanksi: "Patuh" },
              row2: { target: "100%", actual: "100%", sanksi: "Patuh" },
              row3: { target: "100%", actual: "100%", sanksi: "Patuh" },
              row4: { target: "100%", actual: "100%", sanksi: "Patuh" },
              row5: { target: "100%", actual: "100%", sanksi: "Patuh" },
              row6: { target: "100%", actual: "100%", sanksi: "Patuh" },
              row7: { target: "100%", actual: "100%", sanksi: "Patuh" }
            }
          },
          "FE": {
            project_name: document.nama,
            total_temuan: 2,
            status_temuan: "Closed",
            hse_score: 94.50,
            rekomendasi_close: "Kontrak selesai dengan performa HSSE yang sangat baik. Semua temuan audit minor telah diselesaikan dengan bukti yang valid."
          }
        };

        setData(fallbackData[document.type]);
      } catch (err) {
        console.error("Error loading preview in Manager:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, document]);

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col animate-scale-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Hasil Evaluasi - {document.type}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium truncate max-w-[500px]">
              {document.nama}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-650 border-t-transparent" />
              <p className="text-xs font-semibold text-slate-550">Memuat data hasil penilaian...</p>
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* HSE PLAN PREVIEW VIEW */}
              {document.type === "HSE Plan" && (
                <div className="space-y-6 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perusahaan</span>
                      <span className="font-bold text-slate-800 text-xs">{data.vendor_name || "-"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Verifikasi</span>
                      <span className="font-semibold text-slate-700 text-xs">{data.evaluation_date || "-"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Evaluator</span>
                      <span className="font-bold text-slate-800 text-xs">{data.evaluator_name || "-"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lokasi Pekerjaan</span>
                      <span className="font-semibold text-slate-700 text-xs">{data.lokasi_pekerjaan || "-"}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Checklist Score Matrix</h4>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                        <thead className="bg-slate-50 font-bold text-slate-600">
                          <tr>
                            <th className="px-4 py-3">Elemen Penilaian</th>
                            <th className="px-4 py-3 w-32 text-center">Nilai Matriks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-700">
                          {[
                            { key: "scoreP1_1", text: "Komitmen Manajemen melalui Kebijakan & Kepemimpinan" },
                            { key: "scoreP1_2", text: "Kepatuhan Terhadap Regulasi & Prosedur HSSE" },
                            { key: "scoreP1_3", text: "Organisasi, Sumber Daya & Standar Kompetensi" },
                            { key: "scoreP1_4", text: "Manajemen Resiko & Penilaian Bahaya Pekerjaan" },
                            { key: "scoreP7_1", text: "Perencanaan Tindakan Tanggap Darurat & Audit Internal" },
                            { key: "scoreP7_2", text: "Investigasi Insiden & Program Tinjauan Berkala" }
                          ].map((item) => (
                            <tr key={item.key} className="hover:bg-slate-50/40">
                              <td className="px-4 py-3.5 leading-relaxed">{item.text}</td>
                              <td className="px-4 py-3.5 text-center text-indigo-650 font-bold">
                                {data.matrix_scores?.[item.key] || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* PJA PREVIEW VIEW */}
              {document.type === "PJA" && (
                <div className="space-y-6 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perusahaan</span>
                      <span className="font-bold text-slate-800 text-xs">{data.vendor_name || "-"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bidang Usaha</span>
                      <span className="font-semibold text-slate-700 text-xs">{data.bidang_usaha || "-"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lokasi Pekerjaan</span>
                      <span className="font-semibold text-slate-700 text-xs">{data.lokasi_pekerjaan || "-"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Penilaian</span>
                      <span className="font-semibold text-slate-700 text-xs">{data.evaluation_date || "-"}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Questionnaire Details</h4>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                        <thead className="bg-slate-50 font-bold text-slate-600">
                          <tr>
                            <th className="px-4 py-3">Pertanyaan</th>
                            <th className="px-4 py-3 w-28 text-center">Jawaban</th>
                            <th className="px-4 py-3 w-48 text-left">Catatan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-700">
                          {[
                            { key: "scoreP1_1", q: "Apakah Kontraktor telah memiliki Kebijakan & Sasaran Aspek HSSE?" },
                            { key: "scoreP1_2", q: "Apakah Kontraktor memiliki HSSE Plan sesuai dengan sifat pekerjaan?" },
                            { key: "scoreP1_3", q: "Apakah Kontraktor memiliki struktur organisasi HSSE yang memadai?" },
                            { key: "scoreP1_4", q: "Apakah Kontraktor memiliki SOP aspek HSSE?" },
                            { key: "scoreP7_1", q: "Apakah ada rencana pemantauan & tinjauan aspek HSSE berkala?" },
                            { key: "scoreP7_2", q: "Apakah rencana mitigasi kecelakaan kerja sudah disusun?" }
                          ].map((item) => {
                            const ans = data.answers?.[item.key];
                            return (
                              <tr key={item.key} className="hover:bg-slate-50/40">
                                <td className="px-4 py-3.5 leading-relaxed">{item.q}</td>
                                <td className="px-4 py-3.5 text-center">
                                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                    ans === "YES" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
                                  }`}>
                                    {ans || "-"}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5 text-slate-550 italic font-semibold">{data.notes?.[item.key] || "-"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {(data.findings || data.recommendation || data.status || data.due_date) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-700">
                      {data.findings && (
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Findings</span>
                          <span className="block text-slate-500 whitespace-pre-line font-medium leading-relaxed">{data.findings}</span>
                        </div>
                      )}
                      {data.recommendation && (
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Recommendation</span>
                          <span className="block text-slate-500 whitespace-pre-line font-medium leading-relaxed">{data.recommendation}</span>
                        </div>
                      )}
                      {(data.status || data.due_date) && (
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</span>
                          <span className="inline-flex rounded-full px-2 py-1 text-[9px] font-bold border bg-slate-50 text-slate-700 border-slate-200">
                            {data.status || "open"}
                          </span>
                          {data.due_date && (
                            <div className="mt-2">
                              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Due Date</span>
                              <span>{data.due_date}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* WIP PREVIEW VIEW */}
              {document.type === "WIP" && (
                <div className="space-y-6 text-left text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perusahaan</span>
                      <span className="font-bold text-slate-800 text-xs">{data.nama_perusahaan || "-"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stage Evaluasi</span>
                      <span className="font-semibold text-slate-700 text-xs">{data.stage || "-"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lokasi Pekerjaan</span>
                      <span className="font-semibold text-slate-700 text-xs">{data.lokasi_pekerjaan || "-"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Evaluasi</span>
                      <span className="font-semibold text-slate-700 text-xs">{data.tanggal_penilaian || "-"}</span>
                    </div>
                  </div>

                  {/* 1. Lagging */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-[11px] text-indigo-950 uppercase tracking-wider bg-slate-50 px-3 py-1 rounded-lg">I. LAGGING INDICATORS (Stage 2)</h4>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="min-w-full divide-y divide-slate-200 text-[11px]">
                        <thead className="bg-slate-55 font-bold text-slate-700">
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
                            const indicatorData = data.lagging_indicators?.[row.key] || {};
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

                  {/* 2. Leading */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-[11px] text-indigo-950 uppercase tracking-wider bg-slate-50 px-3 py-1 rounded-lg">II. LEADING INDICATORS (Stage 2)</h4>
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
                            const indicatorData = data.leading_indicators?.[row.key] || {};
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
              )}

              {/* FE PREVIEW VIEW */}
              {document.type === "FE" && (
                <div className="space-y-6 text-left text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">HSE Score Akhir</span>
                      <span className="font-black text-indigo-650 text-base">{data.hse_score !== null ? `${data.hse_score} / 100` : "-"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Temuan Akhir</span>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        data.status_temuan === "Closed" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
                      }`}>{data.status_temuan || "-"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Temuan Audit</span>
                      <span className="font-bold text-slate-800 text-xs">{data.total_temuan !== undefined ? data.total_temuan : "-"} temuan</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rekomendasi Penutupan Kontrak</span>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-semibold text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {data.rekomendasi_close || "-"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 font-bold">
              Hasil penilaian belum tersedia atau gagal dimuat.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
