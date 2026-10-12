import { isPublicCatalogue, publicCatalogueApi } from './public-catalogue';

export type RecordItem = {
  id: string; handle: string; title: string; filename: string; expedition: number | null;
  series: number | null; year: number | null; page_count: number; printed_pages: string | null;
  authors: string; abstract: string; provenance: string; ocr_pages: number; ingest_status: string;
  page_no?: number | null; snippet?: string; size_bytes?: number;
};
export type SearchResponse = { query: string; results: RecordItem[]; total: number };
export type AskResponse = {
  answer: string | null; mode: string; notice?: string; query?: string; results?: RecordItem[]; total?: number;
  sources?: { citation: number | string; document_name: string; location: string; excerpt: string; record_id?: string | null }[];
  generation_model?: string | null;
};
export type Capabilities = { assistant: boolean };
export type AssistantDocument = { id: string; display_name: string; kind: string; size_bytes: number; imported_at: string; status: string };
export type AssistantDocumentUpload = { document: AssistantDocument; duplicate: boolean };
export type Status = { api: string; database: string; mailpit: string; queue_depth: number; records: number; indexed_records?: number; catalogued_records?: number; authors?: number; expeditions?: number; scientific_domains?: number; pages: number; photos: number; ocr_pages: number; ocr_coverage: number; ai: string };
export type LibraryItem = {
  id: string; record_id: string | null; handle: string; title: string; authors: string; filename: string;
  file_type: 'PDF' | 'RAR'; issue_date: string | null; year: number | null; expedition: number | null;
  page_count: number | null; size_bytes: number; index_status: 'indexed' | 'catalogued'; provenance: string;
  author_count: number; expedition_name: string | null; expedition_period: string | null;
  lead_institution: string | null; report_type: string | null; scientific_domain: string | null;
  study_location: string | null; page_range: string | null;
  thumbnail_url: string | null; preview_url: string | null; download_url: string; source_url?: string;
};
export type LibraryResponse = {
  items: LibraryItem[]; total: number; page: number; page_size: number;
  facets: { years: number[]; expeditions: number[]; domains: string[]; report_types: string[]; statuses: string[]; file_types: string[]; indexed_count: number; catalogued_count: number };
};
export type OutreachClaim = { id: string; page_no: number; printed_page: string | null; quote: string; score: number; exact_quote: true };
export type OutreachSource = {
  id: string; record_id: string | null; handle: string; title: string; authors: string;
  issue_date: string | null; expedition: number | null; file_type: string;
  index_status: 'indexed' | 'catalogued'; claims: OutreachClaim[]; note: string | null;
};
export type StationDocument = {
  id: string; title: string; handle: string; year: number | null; scientific_domain: string | null;
  report_type: string | null; file_type: 'PDF' | 'RAR'; preview_url: string | null; download_url: string;
};
export type StationDirectory = {
  stations: { id: string; document_count: number; domains: { name: string; count: number }[]; recent: StationDocument[] }[];
  source: string;
};
export type LearnTopic = {
  id: string; title: string; tag: string; minutes: string; summary: string; activity: string;
  question: string; search: string; sources: { title: string; organization: string; url: string }[];
};

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  if (isPublicCatalogue) return publicCatalogueApi(path, init) as T;
  const response = await fetch(path, init);
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`${response.status}: ${detail || response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export function snippetParts(snippet = '') {
  let marked = false;
  const parts: { text: string; marked: boolean }[] = [];
  for (const part of snippet.split(/(<mark>|<\/mark>)/gi).filter(Boolean)) {
    if (part.toLowerCase() === '<mark>') marked = true;
    else if (part.toLowerCase() === '</mark>') marked = false;
    else parts.push({ text: part, marked });
  }
  return parts;
}
