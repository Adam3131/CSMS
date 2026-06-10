import { supabase, isSupabaseConfigured } from "./supabaseClient";

export interface DocumentItem {
  no: number;
  nama: string;
  added: string;
  addedDate: string; // Stored as ISO string in JSON
  status: "New" | "On Progress" | "Done";
  type: "HSE Plan" | "PJA" | "WIP" | "FE";
  nilai?: string;
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
    }));
  } catch (err) {
    console.error("Error in getDocuments:", err);
    return getLocalDocuments();
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
    const { data, error } = await supabase
      .from("documents")
      .insert([
        {
          nama: doc.nama,
          added: doc.added,
          added_date: doc.addedDate,
          status: doc.status,
          type: doc.type,
          nilai: doc.nilai || null,
        },
      ])
      .select();

    if (error) {
      console.warn("Failed to add to Supabase (falling back to localStorage):", error.message);
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
