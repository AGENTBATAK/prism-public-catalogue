import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LibraryResponse, StationDirectory } from './api';

describe('public catalogue without a backend', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_PUBLIC_CATALOGUE', 'true');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ items: [], total: 0 }))));
  });
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
  it('lists all 787 CSV reports without fetching a database or PDF', async () => {
    const { api } = await import('./api');
    const result = await api<LibraryResponse>('/api/library?page_size=24');
    expect(result.total).toBe(787);
    expect(result.items).toHaveLength(24);
    expect(result.facets.indexed_count).toBe(0);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('preserves the supplied South Pole PDF and source page', async () => {
    const { api } = await import('./api');
    const result = await api<LibraryResponse>('/api/library?q=123456789%2F1260');
    expect(result.total).toBe(1);
    expect(result.items[0].preview_url).toBe('http://14.139.119.23:8080/dspace/bitstream/123456789/1260/1/5.30ISEA-First_Expedition_to_SouthPole_Report.pdf');
    expect(result.items[0].source_url).toBe('http://14.139.119.23:8080/dspace/handle/123456789/1260');
    expect(result.items[0].thumbnail_url).toBeNull();
  });
  it('combines year and domain filters and keeps pages disjoint', async () => {
    const { api } = await import('./api');
    const filtered = await api<LibraryResponse>('/api/library?year_from=2010&year_to=2010&domain=Earth%20Sciences%20%26%20Glaciology&page_size=100');
    expect(filtered.total).toBeGreaterThan(0);
    expect(filtered.items.every(item => item.year === 2010 && item.scientific_domain === 'Earth Sciences & Glaciology')).toBe(true);
    const first = await api<LibraryResponse>('/api/library?page=1&page_size=24&sort=title_asc');
    const second = await api<LibraryResponse>('/api/library?page=2&page_size=24&sort=title_asc');
    expect(second.items).toHaveLength(24);
    expect(second.items.every(item => !first.items.some(other => other.id === item.id))).toBe(true);
  });
  it('matches authors, returns empty results honestly, and rejects indexing', async () => {
    const { api } = await import('./api');
    expect((await api<LibraryResponse>('/api/library?q=Rasik')).total).toBeGreaterThan(0);
    expect((await api<LibraryResponse>('/api/library?q=zzzz-unmatched-query')).total).toBe(0);
    expect((await api<LibraryResponse>('/api/library?status=indexed')).total).toBe(0);
    await expect(api('/api/library/1260/index', { method: 'POST' })).rejects.toThrow(/public catalogue/i);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('links station reports to originals without inventing indexed text', async () => {
    const { api } = await import('./api');
    const result = await api<StationDirectory>('/api/stations');
    expect(result.stations).toHaveLength(3);
    expect(result.stations.find(item => item.id === 'maitri')?.document_count).toBeGreaterThan(0);
    expect(result.stations.flatMap(item => item.recent).every(item => item.preview_url?.startsWith('http://14.139.119.23:8080/dspace/bitstream/'))).toBe(true);
  });
  it('keeps the ordinary API path working in local mode', async () => {
    vi.stubEnv('VITE_PUBLIC_CATALOGUE', 'false');
    const { api } = await import('./api');
    await api('/api/library');
    expect(fetch).toHaveBeenCalledWith('/api/library', undefined);
  });
});
