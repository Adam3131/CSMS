import { supabase, isSupabaseConfigured } from "./supabaseClient";

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "documents";

export interface DocumentItem {
  no: number;
  nama: string;
  added: string;
  addedDate: string; // Stored as ISO string in JSON
  status: "New" | "On Progress" | "Done" | "On Review" | "Approved" | "Need Revision" | "Draft";
  type: "HSE Plan" | "PJA" | "WIP" | "FE";
  nilai?: string;
  fileName?: string;
  filePath?: string;
  remarks?: string;
}

const DEFAULT_DOCUMENTS: DocumentItem[] = [
  {
    no: 1,
    nama: "Pengadaan Time Charter 1 (one) Unit VLGC Laycan 19-20 Februari 2024 (LPGC SC Commander LVII)",
    added: "23-Nov-2025",
    addedDate: new Date("2025-11-23").toISOString(),
    status: "New",
    type: "HSE Plan",
  },
  {
    no: 2,
    nama: "Pengadaan Time Charter 1 (satu) Unit Small 2 LPGC Pressurized Laycan 20-21 Februari 2024 (LPGC Gas Laura)",
    added: "19-Oct-2025",
    addedDate: new Date("2025-10-19").toISOString(),
    status: "New",
    type: "HSE Plan",
  },
  {
    no: 3,
    nama: "LPGC Jenggala",
    added: "06-Aug-2025",
    addedDate: new Date("2025-08-06").toISOString(),
    status: "Done",
    type: "PJA",
    nilai: "6.00",
  },
  {
    no: 4,
    nama: "Time Charter 1 (satu) Unit Small 2 LPGC Pressurized Laycan 10-11 Maret 2024 (LPGC Gas Artemis)",
    added: "10-May-2025",
    addedDate: new Date("2025-05-10").toISOString(),
    status: "Done",
    type: "PJA",
    nilai: "5.00",
  },
  {
    no: 5,
    nama: "Pengadaan Time Charter 1 (satu) unit small LPGC Pressurized Laycan 25-26 April 2024 (LPGC Gas Indonesia II)",
    added: "10-May-2025",
    addedDate: new Date("2025-05-10").toISOString(),
    status: "Done",
    type: "WIP",
  },
  {
    no: 6,
    nama: "Pengadaan Time Charter 1 (satu) unit small LPGC Pressurized Laycan 23-24 Mei 2024 (LPGC Gas Kalimantan)",
    added: "10-May-2025",
    addedDate: new Date("2025-05-10").toISOString(),
    status: "On Progress",
    type: "WIP",
  },
  {
    no: 7,
    nama: "Pengadaan COA 1 (satu) Unit Small 1 LPGC Pressurized Laycan 10-12 Juni 2024 (LPGC AE Gas)",
    added: "10-May-2025",
    addedDate: new Date("2025-05-10").toISOString(),
    status: "On Progress",
    type: "WIP",
  },
  {
    no: 8,
    nama: "Pengadaan Time Charter 1 (satu) Unit Midsize LPG Laycan 24-25 Juni 2024 (LPGC Gas Nusa)",
    added: "10-May-2025",
    addedDate: new Date("2025-05-10").toISOString(),
    status: "Done",
    type: "FE",
  },
  {
    no: 9,
    nama: "Pengadaan Time Charter 1 (satu) Unit Midsize LPG Laycan 15-16 Juli 2024 (LPGC Gas Sofia)",
    added: "12-Apr-2025",
    addedDate: new Date("2025-04-12").toISOString(),
    status: "Done",
    type: "FE",
  },
];

const STORAGE_KEY = "csms_documents";

function getLocalDocuments(): DocumentItem[] {
  if (typeof window === "undefined") {
    return DEFAULT_DOCUMENTS;
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DOCUMENTS));
    return DEFAULT_DOCUMENTS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Error parsing documents from localStorage", e);
    return DEFAULT_DOCUMENTS;
  }
}

function saveLocalDocuments(docs: DocumentItem[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  }
}

// Kept for backward compatibility if any local scripts imports it
export function saveDocuments(docs: DocumentItem[]): void {
  saveLocalDocuments(docs);
}

export async function getDocuments(): Promise<DocumentItem[]> {
  if (!isSupabaseConfigured) {
    return getLocalDocuments();
  }

  try {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("no", { ascending: false });

    if (error) {
      console.warn("Failed to fetch from Supabase (falling back to localStorage):", error.message);
      return getLocalDocuments();
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((item: any) => ({
      no: item.no,
      nama: item.nama,
      added: item.added,
      addedDate: item.added_date || item.addedDate,
      status: item.status,
      type: item.type,
      nilai: item.nilai || undefined,
      fileName: item.file_name || undefined,
      filePath: item.file_path || undefined,
      remarks: item.remarks || undefined,
    }));
  } catch (err) {
    console.error("Error in getDocuments:", err);
    return getLocalDocuments();
  }
}

export async function uploadDocumentFile(file: File): Promise<{ fileName: string; filePath: string } | null> {
  if (!isSupabaseConfigured) {
    return {
      fileName: file.name,
      filePath: `local/${Date.now()}_${file.name}`,
    };
  }

  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${Date.now()}_${safeFileName}`;

  try {
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error || !data) {
      console.error(
        `Failed to upload file to Supabase Storage bucket '${STORAGE_BUCKET}':`,
        error?.message || "unknown error"
      );
      if (error?.message?.includes("Bucket not found")) {
        console.error(
          `Supabase Storage bucket '${STORAGE_BUCKET}' does not exist. Create it in the Supabase dashboard or set NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET in your .env.local.`
        );
      }
      return null;
    }

    return {
      fileName: file.name,
      filePath: data.path,
    };
  } catch (err) {
    console.error("Error uploading file to Supabase Storage:", err);
    return null;
  }
}

export async function openDocument(filePath: string): Promise<string | null> {
  if (!isSupabaseConfigured) {
    // no storage configured
    return null;
  }

  try {
    // Try to get a public URL first
    const { data: publicData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
    if (publicData && (publicData as any).publicUrl) {
      return (publicData as any).publicUrl as string;
    }
  } catch (err) {
    // ignore and try download
  }

  try {
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).download(filePath);
    if (error || !data) {
      console.error("Failed to download file from storage:", error?.message || error);
      return null;
    }

    const url = URL.createObjectURL(data);
    // Caller can open the returned blob URL in a new tab. We'll schedule a revoke.
    setTimeout(() => URL.revokeObjectURL(url), 60 * 1000);
    return url;
  } catch (err) {
    console.error("Error downloading file from Supabase:", err);
    return null;
  }
}

export async function addDocument(doc: Omit<DocumentItem, "no">): Promise<DocumentItem[]> {
  if (!isSupabaseConfigured) {
    const current = getLocalDocuments();
    const newDoc: DocumentItem = {
      ...doc,
      no: current.length + 1,
    };
    const updated = [newDoc, ...current];
    saveLocalDocuments(updated);
    return updated;
  }

  try {
    // Map application statuses to database-allowed values to satisfy the check constraint
    const mapStatus = (status: string) => {
      if (status === "Approved") return "Done";
      if (["On Review", "Need Revision", "Draft"].includes(status)) return "On Progress";
      const valid = ["New", "On Progress", "Done"];
      return valid.includes(status) ? status : "On Progress";
    };
    const statusToInsert = mapStatus(doc.status);
    const ALLOWED_TYPES = ["HSE Plan", "PJA", "WIP", "FE"];
    const typeToInsert = ALLOWED_TYPES.includes(doc.type) ? doc.type : "HSE Plan";

    const payload = {
      nama: doc.nama,
      added: doc.added,
      added_date: doc.addedDate,
      status: statusToInsert,
      type: typeToInsert,
      file_name: doc.fileName || null,
      file_path: doc.filePath || null,
      nilai: doc.nilai || null,
    };

    const { data, error } = await supabase
      .from("documents")
      .insert([
        payload,
      ])
      .select();

    if (error) {
      console.warn("Failed to add to Supabase (falling back to localStorage):", error?.message || error);
      console.error("Insert payload:", JSON.stringify(payload));
      const current = getLocalDocuments();
      const newDoc: DocumentItem = {
        ...doc,
        no: current.length + 1,
      };
      const updated = [newDoc, ...current];
      saveLocalDocuments(updated);
      return updated;
    }

    return getDocuments();
  } catch (err) {
    console.error("Error in addDocument:", err);
    const current = getLocalDocuments();
    const newDoc: DocumentItem = {
      ...doc,
      no: current.length + 1,
    };
    const updated = [newDoc, ...current];
    saveLocalDocuments(updated);
    return updated;
  }
}

// Insert a document record and return detailed result for calling code to inspect
export async function insertDocumentRecord(doc: Omit<DocumentItem, "no">): Promise<{ success: boolean; data?: any; error?: any }> {
  if (!isSupabaseConfigured) {
    // Simulate insert locally
    const current = getLocalDocuments();
    const newDoc: DocumentItem = {
      ...doc,
      no: current.length + 1,
    };
    const updated = [newDoc, ...current];
    saveLocalDocuments(updated);
    return { success: true, data: newDoc };
  }

  try {
    // Map application statuses to database-allowed values to satisfy the check constraint
    const mapStatus = (status: string) => {
      if (status === "Approved") return "Done";
      if (["On Review", "Need Revision", "Draft"].includes(status)) return "On Progress";
      const valid = ["New", "On Progress", "Done"];
      return valid.includes(status) ? status : "On Progress";
    };
    const statusToInsert = mapStatus(doc.status);
    const ALLOWED_TYPES = ["HSE Plan", "PJA", "WIP", "FE"];
    const typeToInsert = ALLOWED_TYPES.includes(doc.type) ? doc.type : "HSE Plan";

    const payload = {
      nama: doc.nama,
      added: doc.added,
      added_date: doc.addedDate,
      status: statusToInsert,
      type: typeToInsert,
      file_name: doc.fileName || null,
      file_path: doc.filePath || null,
      nilai: doc.nilai || null,
    };

    const { data, error } = await supabase.from("documents").insert([payload]).select();

    if (error) {
      const errMsg = (error && (error as any).message) || JSON.stringify(error);
      console.error("Failed insert payload:", JSON.stringify(payload));
      return { success: false, error: errMsg };
    }

    return { success: true, data };
  } catch (err) {
    const errMsg = err && (err as any).message ? (err as any).message : String(err);
    return { success: false, error: errMsg };
  }
}

export async function deleteDocument(no: number): Promise<DocumentItem[]> {
  if (!isSupabaseConfigured) {
    const current = getLocalDocuments();
    const updated = current.filter((d) => d.no !== no);
    saveLocalDocuments(updated);
    return updated;
  }

  try {
    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("no", no);

    if (error) {
      console.warn("Failed to delete from Supabase (falling back to localStorage):", error.message);
      const current = getLocalDocuments();
      const updated = current.filter((d) => d.no !== no);
      saveLocalDocuments(updated);
      return updated;
    }

    return getDocuments();
  } catch (err) {
    console.error("Error in deleteDocument:", err);
    const current = getLocalDocuments();
    const updated = current.filter((d) => d.no !== no);
    saveLocalDocuments(updated);
    return updated;
  }
}

export async function updateDocumentStatus(no: number, status: string, remarks?: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    const current = getLocalDocuments();
    const updated = current.map((doc) => doc.no === no ? { ...doc, status: status as any, remarks } : doc);
    saveLocalDocuments(updated);
    return true;
  }

  try {
    const { error } = await supabase
      .from("documents")
      .update({ status, remarks })
      .eq("no", no);

    if (error) {
      console.warn("Failed to update status in Supabase (falling back to localStorage):", error.message);
      const current = getLocalDocuments();
      const updated = current.map((doc) => doc.no === no ? { ...doc, status: status as any, remarks } : doc);
      saveLocalDocuments(updated);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in updateDocumentStatus:", err);
    return false;
  }
}
