import { requestPublicAssistant } from './assistant-client';
import catalogue from './content/public-catalogue.json';
import type { LibraryItem, LibraryResponse, StationDirectory } from './api';

export const isPublicCatalogue = import.meta.env.VITE_PUBLIC_CATALOGUE === 'true';
const items: LibraryItem[] = catalogue as LibraryItem[];
const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
const normalized = (value: string) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const unique = <T,>(values: T[]) => [...new Set(values)];
const facets: LibraryResponse['facets'] = {
  years: unique(items.flatMap(item => item.year === null ? [] : [item.year])).sort((a, b) => b - a),
  expeditions: unique(items.flatMap(item => item.expedition === null ? [] : [item.expedition])).sort((a, b) => a - b),
  domains: unique(items.flatMap(item => item.scientific_domain ? [item.scientific_domain] : [])).sort(collator.compare),
  report_types: unique(items.flatMap(item => item.report_type ? [item.report_type] : [])).sort(collator.compare),
  statuses: ['catalogued'], file_types: ['PDF'], indexed_count: 0, catalogued_count: items.length,
};
export const publicYearCounts = Object.fromEntries(facets.years.map(year => [year, items.filter(item => item.year === year).length]));
function positive(value: string | null, fallback: number, max = Number.MAX_SAFE_INTEGER) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 1 ? Math.min(max, Math.floor(number)) : fallback;
}
function library(params: URLSearchParams): LibraryResponse {
  const terms = normalized(params.get('q') || '').split(/\s+/).filter(Boolean);
  const filtered = items.filter(item => {
    const text = normalized([item.title, item.authors, item.handle, item.expedition_name, item.lead_institution, item.study_location, item.scientific_domain].join(' '));
    return terms.every(term => text.includes(term))
      && (!params.get('expedition') || item.expedition === Number(params.get('expedition')))
      && (!params.get('year_from') || (item.year !== null && item.year >= Number(params.get('year_from'))))
      && (!params.get('year_to') || (item.year !== null && item.year <= Number(params.get('year_to'))))
      && (!params.get('domain') || item.scientific_domain === params.get('domain'))
      && (!params.get('report_type') || item.report_type === params.get('report_type'))
      && (!params.get('status') || item.index_status === params.get('status'))
      && (!params.get('file_type') || item.file_type === params.get('file_type'));
  });
  const sorts: Record<string, keyof LibraryItem> = { title: 'title', date: 'issue_date', year: 'year', expedition: 'expedition', authors: 'author_count', size: 'size_bytes', pages: 'page_count', handle: 'handle' };
  const [sort, direction] = (params.get('sort') || 'title_asc').split('_');
  const field = sorts[sort] || 'title';
  filtered.sort((a, b) => {
    const av = a[field]; const bv = b[field];
    if (av === null && bv !== null) return 1;
    if (bv === null && av !== null) return -1;
    const comparison = typeof av === 'number' && typeof bv === 'number' ? av - bv : collator.compare(String(av ?? ''), String(bv ?? ''));
    return (direction === 'desc' ? -comparison : comparison) || collator.compare(a.handle, b.handle);
  });
  const page = positive(params.get('page'), 1);
  const page_size = positive(params.get('page_size'), 24, 100);
  return { items: filtered.slice((page - 1) * page_size, page * page_size), total: filtered.length, page, page_size, facets };
}
function stations(): StationDirectory {
  return { source: 'Supplied catalogue metadata; source PDFs hosted by NCPOR', stations: ['maitri', 'bharati', 'himadri'].map(id => {
    const matches = items.filter(item => normalized([item.title, item.study_location, item.expedition_name].join(' ')).includes(id));
    const counts = new Map<string, number>();
    for (const item of matches) if (item.scientific_domain) counts.set(item.scientific_domain, (counts.get(item.scientific_domain) || 0) + 1);
    return { id, document_count: matches.length,
      domains: [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
      recent: [...matches].sort((a, b) => (b.year || 0) - (a.year || 0)).slice(0, 3),
    };
  }) };
}
export function publicCatalogueApi(path: string, init?: RequestInit): unknown {
  if (new URL(path, 'https://prism.invalid').pathname === '/api/ask' && init?.method?.toUpperCase() === 'POST') return requestPublicAssistant(JSON.parse(String(init.body || '{}')));
  if (init?.method && init.method.toUpperCase() !== 'GET') throw new Error('This action requires the local app and is unavailable in the public catalogue.');
  const url = new URL(path, 'https://prism.invalid');
  switch (url.pathname) {
    case '/api/capabilities': return {assistant:true,document_upload:false};
    case '/api/library': return library(url.searchParams);
    case '/api/stations': return stations();
    case '/api/status': return { api: 'static catalogue', database: 'not required', mailpit: 'disabled', queue_depth: 0, records: items.length, indexed_records: 0, catalogued_records: items.length, authors: unique(items.flatMap(item => item.authors.split(',').map(author => author.trim()).filter(Boolean))).length, expeditions: facets.expeditions.length, scientific_domains: facets.domains.length, pages: 0, photos: 0, ocr_pages: 0, ocr_coverage: 0, ai: 'disabled' };
    case '/api/records': return { records: [], total: 0 };
    case '/api/auth/demo-users': return { users: [] };
    case '/api/auth/me': throw new Error('Sign-in is unavailable in the public catalogue.');
    default: throw new Error('This feature requires the local app and is unavailable in the public catalogue.');
  }
}
