import {AssistantAnswer,SourceLink} from './AssistantAnswer';
import { historyFromTurns, maintenanceResponse } from '../assistant-client';
import { isPublicCatalogue, publicYearCounts } from '../public-catalogue';
import { ChangeEvent, CSSProperties, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router';
import { ArrowDown, ArrowLeft, ArrowRight, BookOpen, Check, Moon, Search, Sun, Globe2, ShieldCheck, Sparkles, Library, Grid2X2, Rows3, Download, FileText, ChevronLeft, ChevronRight, Send, Copy, Plus, Paperclip, LogIn, LogOut, MapPin, GraduationCap, Microscope, Snowflake, Waves, Wind, Layers3, ExternalLink, FlaskConical, GalleryHorizontal, Maximize2, Share2, X, BarChart3, Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { usePreferences } from '../store';
import { api, AskResponse, AssistantDocumentUpload, Capabilities, LearnTopic, LibraryItem, LibraryResponse, OutreachSource, RecordItem, SearchResponse, StationDirectory, Status, snippetParts } from '../api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { lessons } from '../content/learn';

const gallerySourceModules = import.meta.glob('../../Gallery source/*.{avif,gif,jpeg,jpg,png,webp}', { eager: true, import: 'default', query: '?url' });
const gallerySourceImages = Object.entries(gallerySourceModules).map(([path, url]) => ({
  src: url as string,
  alt: path.split(/[\\/]/).pop()?.replace(/[-_]/g, ' ').replace(/\.[^.]+$/, '') || 'Polar field image',
}));
const galleryFallbackImages = [
  { src: `${import.meta.env.BASE_URL}images/hero/maitri_station.webp`, alt: 'Maitri station in Antarctica' },
  { src: `${import.meta.env.BASE_URL}images/hero/bharati_station_arch2o.jpg?v=2`, alt: 'Bharati station in Antarctica' },
  { src: `${import.meta.env.BASE_URL}images/hero/himadri_station.webp`, alt: 'Himadri station in Svalbard' },
];

function DisplayTools() {
  const { t } = useTranslation();
  const { theme, setTheme, textScale, setTextScale, lang, setLang } = usePreferences();
  const scales = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
  const scaleIndex = scales.indexOf(textScale);
  const changeScale = (step: number) => setTextScale(scales[Math.max(0, Math.min(4, scaleIndex + step))]);
  return <div className="display-tools" aria-label="Display preferences">
    <button className="icon-button scale-button" aria-label={t('decreaseText')} title={`Text Scale: ${textScale.toUpperCase()}`} onClick={() => changeScale(-1)} disabled={scaleIndex === 0}><span>A−</span></button>
    <button className="icon-button scale-button" aria-label={t('increaseText')} title={`Text Scale: ${textScale.toUpperCase()}`} onClick={() => changeScale(1)} disabled={scaleIndex === 4}><span>A+</span></button>
    <button className="icon-button" aria-label={theme === 'light' ? t('darkMode') : t('lightMode')} aria-pressed={theme === 'dark'} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}</button>
    <label className="language-select"><Globe2 size={15} /><span className="sr-only">{t('language')}</span><select value={lang} aria-label={t('language')} onChange={(event) => { const value = event.target.value as 'en' | 'hi'; setLang(value); void i18n.changeLanguage(value); }}><option value="en">English</option><option value="hi">हिन्दी</option></select></label>
  </div>;
}


function Header() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const demos = useQuery({ queryKey: ['demo-users'], queryFn: () => api<{ users: { email: string; name: string; role: string }[] }>('/api/auth/demo-users') });
  const profile = useQuery({ queryKey: ['me'], queryFn: () => api<{ user: { email: string; name: string; role: string; preferences: { theme?: 'light' | 'dark'; textScale?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; lang?: 'en' | 'hi' } } }>('/api/auth/me'), enabled: !isPublicCatalogue, retry: false });
  const [switchError, setSwitchError] = useState('');
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const switchUser = async (email: string) => {
    setSwitchError('');
    try {
      if (!email) {
        await api('/api/auth/logout', { method: 'POST' });
        queryClient.removeQueries({ queryKey: ['me'] });
        return;
      }
      const session = await api<{ user: { email: string; name: string; role: string; preferences: { theme?: 'light' | 'dark'; textScale?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; lang?: 'en' | 'hi' } } }>('/api/auth/demo-login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      queryClient.setQueryData(['me'], session);
      const preferences = session.user.preferences;
      if (preferences.theme) usePreferences.getState().setTheme(preferences.theme);
      if (preferences.textScale) usePreferences.getState().setTextScale(preferences.textScale);
      if (preferences.lang) { usePreferences.getState().setLang(preferences.lang); void i18n.changeLanguage(preferences.lang); }
    } catch { setSwitchError('Demo login failed. Check that PRISM API is running.'); }
  };
  return <>
    <a className="skip-link" href="#main" onClick={isPublicCatalogue ? (event) => { event.preventDefault(); const main = document.getElementById('main'); if (main) { main.tabIndex = -1; main.focus(); main.scrollIntoView(); } } : undefined}>{t('skip')}</a>
    <header className="site-header">
      <Link to="/" className="brand" aria-label="PRISM — Polar Repository for Integrated Science and Media home"><img className="brand-logo" src={`${import.meta.env.BASE_URL}images/prism-logo-transparent.png?v=2`} alt="PRISM logo" /><span className="brand-name">PRISM<small>Polar Repository for Integrated Science and Media</small></span></Link>
      <nav className="main-nav" aria-label="Main navigation">
        <NavLink to="/home">{t('home')}</NavLink><NavLink to="/stations"><MapPin size={15} />{t('stations')}</NavLink><NavLink to="/gallery"><GalleryHorizontal size={15} />{t('gallery')}</NavLink><NavLink to="/learn"><GraduationCap size={15} />{t('learn')}</NavLink><NavLink to="/library"><Library size={15} />{t('library')}</NavLink>{!isPublicCatalogue && <><NavLink to="/explore"><Search size={15} />{t('explore')}</NavLink></>}<NavLink to="/ask">{t('ask')}</NavLink>
        <button className="mobile-nav-more" type="button" aria-expanded={mobileMoreOpen} aria-controls="mobile-more-menu" onClick={() => setMobileMoreOpen((open) => !open)}><Menu size={16} />{t('more')}</button>
      </nav>
      {mobileMoreOpen && <div id="mobile-more-menu" className="mobile-more-menu"><NavLink to="/library" onClick={() => setMobileMoreOpen(false)}><Library size={16} />{t('library')}</NavLink>{!isPublicCatalogue && <><NavLink to="/explore" onClick={() => setMobileMoreOpen(false)}><Search size={16} />{t('explore')}</NavLink><NavLink to="/ask" onClick={() => setMobileMoreOpen(false)}>{t('ask')}</NavLink><NavLink to="/graph" onClick={() => setMobileMoreOpen(false)}>{t('knowledgeGraph')}</NavLink><NavLink to="/status" onClick={() => setMobileMoreOpen(false)}>{t('status')}</NavLink></>}<NavLink to="/ask" onClick={() => setMobileMoreOpen(false)}>{t('ask')}</NavLink></div>}
      <div className="header-right">
        {demos.data?.users.length ? <label className="demo-switch"><span>{profile.data?.user.role?.toUpperCase() || t('publicRole')}</span><select value={profile.data?.user.email || ''} aria-label={t('switchUser')} onChange={(event) => void switchUser(event.target.value)}><option value="">{t('publicRole')}</option>{demos.data.users.map((user) => <option key={user.email} value={user.email}>{user.name} · {user.role}</option>)}</select></label> : profile.data ? <div className="local-account"><span>{profile.data.user.name} · {profile.data.user.role}</span><button type="button" aria-label={t('signOut')} onClick={() => void switchUser('')}><LogOut size={14} />{t('signOut')}</button></div> : !isPublicCatalogue && !profile.isLoading && <Link className="header-signin" to="/login"><LogIn size={14} />{t('signIn')}</Link>}
        <DisplayTools />
      </div>
      {switchError && <span className="switch-error" role="status">{switchError}</span>}
    </header>
  </>;
}

function Provenance({ type = 'OFFICIAL ARCHIVE' }: { type?: string }) {
  const { t } = useTranslation();
  const label = type === 'OFFICIAL ARCHIVE' ? t('official') : type === 'CURATED' ? t('curated') : type === 'DEMO' ? t('demo') : type;
  return <span className={`provenance provenance-${type.toLowerCase().replaceAll(' ', '-')}`}><i />{label}</span>;
}

function Landing() {
  const { t } = useTranslation();
  useEffect(() => {
    const panels = document.querySelectorAll<HTMLElement>('.landing-panel, .landing-home');
    if (!('IntersectionObserver' in window)) {
      panels.forEach((panel) => panel.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.28, rootMargin: '0px 0px -5% 0px' });
    panels.forEach((panel) => observer.observe(panel));
    return () => observer.disconnect();
  }, []);
  const panels = [
    { no: '01', name: t('stationMaitri'), sub: 'ANTARCTICA · 70°45′ S', body: t('stationMaitriCopy'), cls: 'maitri', count: '1989', image: `${import.meta.env.BASE_URL}images/hero/maitri_station.webp`, alt: t('maitriPhotoAlt'), credit: 'Ministry of Science & Technology, Government of India', creditUrl: 'https://commons.wikimedia.org/wiki/File:An_aerial_view_of_the_Indian_Station_Maitri,_Antarctica_on_February_2,_2005.jpg', license: 'GODL-India', licenseUrl: 'https://data.gov.in/sites/default/files/Gazette_Notification_OGDL.pdf', note: '' },
    { no: '02', name: t('stationBharati'), sub: 'LARSEMANN HILLS · ANTARCTICA', body: t('stationBharatiCopy'), cls: 'bharati', count: '2012', image: `${import.meta.env.BASE_URL}images/hero/bharati_station_arch2o.jpg?v=2`, alt: t('bharatiPhotoAlt'), credit: 'Bof Arkitekten', creditUrl: 'https://www.arch2o.com/bharati-antarctica-research-station-bof-arkitekten/', license: 'Source supplied for PRISM', licenseUrl: 'https://www.arch2o.com/bharati-antarctica-research-station-bof-arkitekten/', note: '' },
    { no: '03', name: t('stationHimadri'), sub: 'NY-ÅLESUND · SVALBARD', body: t('stationHimadriCopy'), cls: 'himadri', count: '2008', image: `${import.meta.env.BASE_URL}images/hero/himadri_station.webp`, alt: t('himadriPhotoAlt'), credit: 'Lekhraj Saini · Imaggeo / EGU', creditUrl: 'https://imaggeo.egu.eu/view/18921/', license: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/', note: '' },
  ];
  return <main id="main" className="landing">
    {panels.map((panel, index) => <section className={`landing-panel ${panel.cls}`} key={panel.no} aria-label={`${panel.name} polar research station`}>
      <div className="hero-media"><img className="hero-photo" src={panel.image} alt={panel.alt} fetchPriority={index === 0 ? 'high' : 'auto'} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" /><span className="hero-wash" aria-hidden="true" /></div>
      <div className="panel-content">
        <div className="eyebrow"><span>{panel.no}</span>{t('heroEyebrow')}</div>
        <p className="station-coordinate">{panel.sub} <span>· EST. {panel.count}</span></p>
        <h1>{index === 0 ? t('heroTitle') : panel.name}</h1>
        <p className="hero-copy">{index === 0 ? t('heroBody') : panel.body}</p>
        <div className="landing-actions"><Link className="button button-pop" to="/home">{t('enter')} <ArrowRight size={17} /></Link>{index === 2 && <Link className="text-link" to="/explore">{t('browseArchive')} <ArrowRight size={15} /></Link>}</div>
        {index < panels.length - 1 && <a className="scroll-cue" href={`#station-${index + 1}`} onClick={isPublicCatalogue ? (event) => { event.preventDefault(); document.getElementById(`station-${index + 1}`)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); } : undefined}><span>{t('scroll')}</span><ArrowDown size={15} /></a>}
      </div>
      <div className="image-credit"><span className="credit-mark" /><div><span className="credit-label">{t('photoCredit')}</span><a href={panel.creditUrl} target="_blank" rel="noreferrer">{panel.credit}</a><a className="license-link" href={panel.licenseUrl} target="_blank" rel="noreferrer">{panel.license}</a>{panel.note && <span className="photo-context">{panel.note}</span>}</div></div>
      <span className="panel-index" id={index > 0 ? `station-${index}` : undefined}>{panel.no} / 03</span>
    </section>)}
    <section className="landing-home page-wrap" aria-label={t('home')}>{isPublicCatalogue ? <PublicIntro /> : <HomeContent embedded />}</section>
  </main>;
}


function ErrorNotice({ message }: { message: string }) { return <div className="notice notice-warn" role="status">{message}</div>; }

function PublicIntro() {
  const { t } = useTranslation();
  return <section className="page-wrap section-block"><div className="eyebrow">PRISM / {t('publicCatalogueLabel')}</div><h2>{t('libraryTitle')}</h2><p>{t('publicCatalogueNotice')}</p><Link className="button button-pop" to="/library">{t('browseArchive')} <ArrowRight size={16} /></Link></section>;
}
function PublicUnavailable() {
  const { t } = useTranslation();
  return <main id="main" className="page-wrap"><h1>{t('localFeatureTitle')}</h1><p>{t('localFeatureNotice')}</p><Link className="button button-pop" to="/library">{t('browseArchive')}</Link></main>;
}

function Home() {
  return <div className="home-route-wrapper"><main id="main" className="page-wrap home-page"><HomeContent /></main></div>;
}

function HomeContent({ embedded = false }: { embedded?: boolean }) {
  const { t } = useTranslation();
  const records = useQuery({ queryKey: ['records'], queryFn: () => api<{ records: RecordItem[]; total: number }>('/api/records') });
  const status = useQuery({ queryKey: ['status'], queryFn: () => api<Status>('/api/status') });
  const openRecords = records.data?.records ?? [];
  return <>
    <section className="home-intro">
      {embedded && <div className="eyebrow archive-section-marker">PRISM / 26063 · {t('allRecords')}</div>}
      <div className="eyebrow"><span className="live-dot" />{t('onThisDevice')}</div>
      <h1>{t('heroTitle')}</h1><p>{t('heroBody')}</p>
      <form action="/explore" className="search-hero" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); location.href = `${import.meta.env.BASE_URL}${isPublicCatalogue ? '#/library' : 'explore'}?q=${encodeURIComponent(String(data.get('q') || ''))}`; }}>
        <Search size={19} /><input name="q" placeholder={t('searchPlaceholder')} aria-label={t('searchPlaceholder')} /><button className="button button-pop">{t('search')} <ArrowRight size={16} /></button>
      </form>
      <div className="intro-note"><ShieldCheck size={16} />{t('localOnly')}</div>
    </section>
    <section className="stats-row" aria-label="Archive counts">
      <Stat label={t('documents')} value={status.data?.records} /><Stat label={t('authorsIdentified')} value={status.data?.authors} /><Stat label={t('expeditionsIndexed')} value={status.data?.expeditions} /><Stat label={t('scientificDomains')} value={status.data?.scientific_domains} />
    </section>
    <p className="stats-note">{t('metricSubsetNote')}</p>
    {status.isError && <ErrorNotice message={t('offline')} />}
    <section className="section-block">
      <div className="section-heading"><div><span className="eyebrow">01 / {t('archive')}</span><h2>{t('indexedRecords')}</h2></div><Link to="/library" className="text-link">{t('browseArchive')} <ArrowRight size={15} /></Link></div>
      {records.isLoading ? <p className="muted">{t('loading')}</p> : openRecords.length === 0 ? <div className="empty-state"><BookOpen size={24} /><p>{t('noTextIndexed')}</p><span>{t('allCaughtUp')}</span><Link to="/library">{t('browseArchive')}</Link></div> : <div className="record-grid">{openRecords.slice(0, 6).map((record) => <RecordCard key={record.id} record={record} />)}</div>}
    </section>
    <section className="evidence-band"><div className="evidence-icon"><ShieldCheck size={23} /></div><div><span className="eyebrow">{t('passageFinder')}</span><h2>{t('evidenceFirst')}</h2><p>{t('evidenceBody')}</p></div><Link className="button button-outline" to="/ask">{t('ask')} <ArrowRight size={16} /></Link></section>
  </>;
}

function FeatureDemo() {
  const steps = [
    { number: '01', title: 'Browse the archive', copy: 'Open the local catalogue and select an original polar-research document.', to: '/library', action: 'Open Library' },
    { number: '02', title: 'Index one document', copy: 'In Story Forge, select “Index this document” to extract text and use OCR for scanned pages.', to: '/library', action: 'Try Story Forge' },
    { number: '03', title: 'Find source evidence', copy: 'Search the indexed text, then open the exact PDF page behind each result.', to: '/explore', action: 'Search evidence' },
    { number: '04', title: 'Create a verified draft', copy: 'Story Forge turns an exact source quote into an editable, copy-only social-post draft.', to: '/studio/gallery', action: 'Open Story Forge' },
  ];
  return <main id="main" className="page-wrap feature-demo">
    <div className="eyebrow">PRISM / FEATURE DEMO</div>
    <h1>See PRISM work in four steps.</h1>
    <p className="feature-demo-intro">This local demo shows how PRISM preserves original research, makes it searchable, and keeps every useful claim connected to source evidence.</p>
    <div className="feature-demo-grid">{steps.map((step) => <article className="feature-demo-card" key={step.number}><span>{step.number}</span><h2>{step.title}</h2><p>{step.copy}</p><Link className="text-link" to={step.to}>{step.action} <ArrowRight size={15} /></Link></article>)}</div>
    <section className="feature-demo-note"><ShieldCheck size={20} /><div><strong>Local and evidence-first</strong><p>Original files remain in the archive. OCR, search, page evidence, and copy-only Story Forge drafts run on this device.</p></div></section>
  </main>;
}

function GalleryPage() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<{ src: string; alt: string } | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const status = useQuery({ queryKey: ['status'], queryFn: () => api<Status>('/api/status') });
  const catalogue = useQuery({ queryKey: ['gallery-catalogue'], queryFn: () => api<LibraryResponse>('/api/library?page=1&page_size=96&sort=year_desc') });
  const images = gallerySourceImages.length ? gallerySourceImages : galleryFallbackImages;
  const reel = Array.from({ length: Math.max(18, images.length * 6) }, (_, index) => ({ ...images[index % images.length], key: index }));
  const years = catalogue.data?.facets.years ?? [];
  const chartYears = years.slice(0, 6).reverse();
  useEffect(() => {
    if (!selected) return;
    closeButtonRef.current?.focus();
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setSelected(null); return; }
      if (event.key !== 'Tab') return;
      const dialog = document.querySelector<HTMLElement>('.gallery-lightbox-frame');
      const focusable = dialog ? Array.from(dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter((element) => !element.hasAttribute('disabled')) : [];
      if (!focusable.length) return;
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', close);
    return () => { window.removeEventListener('keydown', close); triggerRef.current?.focus(); };
  }, [selected]);
  const openLightbox = (image: { src: string; alt: string }, trigger: HTMLButtonElement) => { triggerRef.current = trigger; setSelected(image); };
  return <main id="main" className="gallery-page">
    <section className="gallery-intro page-wrap">
      <div><h1>{t('galleryTitle')}</h1><p>{t('galleryIntro')}</p></div>
      <div className="gallery-source-note"><GalleryHorizontal size={18} /><span>{gallerySourceImages.length ? `${gallerySourceImages.length} ${t('galleryImported')}` : t('galleryFallback')}</span></div>
    </section>
    <section className="gallery-reel" aria-label={t('galleryTitle')}>
      <div className="gallery-track">
        {reel.map((image, index) => <figure className="gallery-tile" style={{ '--tile-order': index % 6 } as CSSProperties} key={`${image.src}-${image.key}`}><button type="button" onClick={(event) => openLightbox(image, event.currentTarget)} aria-label={`${t('galleryOpen')}: ${image.alt}`}><img src={image.src} alt={image.alt} loading={index < 6 ? 'eager' : 'lazy'} /><figcaption><span>{String(index + 1).padStart(2, '0')}</span>{image.alt}</figcaption><span className="gallery-expand"><Maximize2 size={17} /></span></button></figure>)}
      </div>
    </section>
    <section className="gallery-insights page-wrap" aria-label={t('galleryDataTitle')}>
      <div className="gallery-insights-heading"><div><span className="eyebrow"><BarChart3 size={14} /> {t('galleryDataKicker')}</span><h2>{t('galleryDataTitle')}</h2></div><span className="mono">{t('galleryLiveData')}</span></div>
      <div className="gallery-data-grid">
        <article className="gallery-data-card"><span>{t('galleryExpeditions')}</span><strong>{status.data?.expeditions ?? '—'}</strong><p>{t('galleryExpeditionsNote')}</p><div className="data-rings" aria-hidden="true"><i /><i /><i /></div></article>
        <article className="gallery-data-card"><span>{t('galleryDomains')}</span><strong>{status.data?.scientific_domains ?? '—'}</strong><p>{t('galleryDomainsNote')}</p><div className="domain-bars" aria-hidden="true"><i /><i /><i /><i /></div></article>
        <article className="gallery-data-card growth-card"><span>{t('galleryGrowth')}</span><strong>{status.data?.records?.toLocaleString() ?? '—'}</strong><p>{years.length ? `${years.at(-1)}–${years[0]} · ${t('galleryCoverage')}` : t('galleryGrowthNote')}</p><div className="growth-bars" aria-label={t('galleryGrowthNote')}>{chartYears.map((year, index) => <i key={year} style={{ height: `${isPublicCatalogue ? Math.max(4, (publicYearCounts[year] || 0) / Math.max(...Object.values(publicYearCounts)) * 100) : 36 + index * 11}%` }} title={isPublicCatalogue ? `${year}: ${publicYearCounts[year] || 0} reports` : String(year)} />)}{!chartYears.length && <i />}</div></article>
      </div>
    </section>
    {selected && <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={selected.alt} onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><div className="gallery-lightbox-frame"><button ref={closeButtonRef} className="lightbox-close" type="button" onClick={() => setSelected(null)} aria-label={t('galleryClose')}><X size={20} /></button><img src={selected.src} alt={selected.alt} /><div className="lightbox-footer"><div><span className="eyebrow">PRISM / {t('gallery')}</span><h2>{selected.alt}</h2></div><div className="lightbox-actions"><a className="button-outline" href={selected.src} download><Download size={16} />{t('galleryDownload')}</a>{!isPublicCatalogue && <Link className="button button-pop" to={`/studio/gallery?title=${encodeURIComponent(selected.alt)}&image=${encodeURIComponent(selected.src)}`}><Share2 size={16} />{t('galleryPost')}</Link>}</div></div></div></div>}
  </main>;
}

function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const session = await api<{ user: { id: string; email: string; name: string; role: string; demo: boolean; preferences: { theme?: 'light' | 'dark'; textScale?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; lang?: 'en' | 'hi' } } }>('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      queryClient.setQueryData(['me'], session);
      const preference = session.user.preferences;
      if (preference.theme) usePreferences.getState().setTheme(preference.theme);
      if (preference.textScale) usePreferences.getState().setTextScale(preference.textScale);
      if (preference.lang) { usePreferences.getState().setLang(preference.lang); void i18n.changeLanguage(preference.lang); }
      navigate('/library');
    } catch { setError(t('loginFailed')); }
    finally { setSubmitting(false); }
  };
  return <main id="main" className="page-wrap login-page"><div className="login-card"><span className="eyebrow">PRISM / {t('localSignIn')}</span><h1>{t('signIn')}</h1><p>{t('localSignInInfo')}</p><form className="login-form" onSubmit={(event) => void submit(event)}><label>{t('email')}<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>{t('password')}<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error && <div className="notice notice-warn" role="alert">{error}</div>}<button className="button button-pop" disabled={submitting}>{submitting ? t('loading') : t('signIn')} <LogIn size={15} /></button></form><Link className="text-link" to="/library">{t('backToLibrary')} <ArrowRight size={14} /></Link></div></main>;
}

function Stat({ label, value }: { label: string; value: number | undefined }) {
  return <div className="stat"><span className="stat-value">{value === undefined ? '—' : value.toLocaleString()}</span><span>{label}</span></div>;
}

function RecordCard({ record }: { record: RecordItem }) {
  const { t } = useTranslation();
  return <Link className="record-card" to={`/records/${record.id}`}>
    <div className="card-meta"><Provenance type={record.provenance} /><span className="mono">{record.handle}</span></div>
    <h3>{record.title}</h3><p>{record.abstract || record.authors || record.filename}</p>
    <div className="card-footer"><span>{record.expedition ? `${record.expedition}${ordinalSuffix(record.expedition)} expedition` : t('expeditionUnknown')}</span><span>{record.page_count} pp.</span><ArrowRight size={16} /></div>
  </Link>;
}

function fileSize(bytes: number) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function issueDate(value: string | null) {
  if (!value) return '—';
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(parsed);
}

function LibraryCover({ item }: { item: LibraryItem }) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(!item.thumbnail_url);
  useEffect(() => setFailed(!item.thumbnail_url), [item.id, item.thumbnail_url]);
  if (item.file_type !== 'PDF' || failed || !item.thumbnail_url) {
    return <div className="library-cover-placeholder"><FileText size={29} /><span>{item.file_type}</span>{isPublicCatalogue && <small>{t('genericPdfCover')}</small>}</div>;
  }
  return <img className="library-cover-image" src={item.thumbnail_url} loading="lazy" alt={`First-page thumbnail for ${item.title}`} onError={() => setFailed(true)} />;
}

function LibraryPage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const mode = usePreferences((s) => s.mode);
  const setMode = usePreferences((s) => s.setMode);
  const q = params.get('q') || '';
  const view = params.get('view') || (mode === 'research' ? 'table' : 'cards');
  const page = Math.max(1, Number(params.get('page') || 1));
  const size = 24;
  const sort = params.get('sort') || (view === 'table' ? 'date_desc' : 'title_asc');
  const expedition = params.get('expedition') || '';
  const year = params.get('year') || '';
  const domain = params.get('domain') || '';
  const reportType = params.get('report_type') || '';
  const status = params.get('status') || '';
  const fileType = params.get('file_type') || '';
  const searchParams = new URLSearchParams({ page: String(page), page_size: String(size), sort });
  if (q) searchParams.set('q', q);
  if (expedition) searchParams.set('expedition', expedition);
  if (year) { searchParams.set('year_from', year); searchParams.set('year_to', year); }
  if (domain) searchParams.set('domain', domain);
  if (reportType) searchParams.set('report_type', reportType);
  if (status) searchParams.set('status', status);
  if (fileType) searchParams.set('file_type', fileType);
  const result = useQuery({ queryKey: ['library', searchParams.toString()], queryFn: () => api<LibraryResponse>(`/api/library?${searchParams}`) });

  const updateParam = (key: string, value: string) => setParams((previous) => {
    const next = new URLSearchParams(previous);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    return next;
  });
  const runSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    updateParam('q', String(form.get('q') || '').trim());
  };
  const changeView = (value: 'cards' | 'table') => {
    setMode(value === 'table' ? 'research' : 'discover');
    updateParam('view', value);
  };
  const response = result.data;
  const pageCount = response ? Math.max(1, Math.ceil(response.total / response.page_size)) : 1;
  const firstNumber = response?.total ? (page - 1) * size + 1 : 0;
  const lastNumber = response ? Math.min(page * size, response.total) : 0;

  return <main id="main" className="page-wrap library-page">
    <div className="eyebrow">PRISM / {t('library')}</div>
    <div className="library-title-row"><div><h1>{t('libraryTitle')}</h1><p>{t('libraryIntro')}</p></div><div className="library-count"><span>{response?.total.toLocaleString() ?? '—'}</span><small>{t('documents')}</small></div></div>
    {isPublicCatalogue && <div className="notice">{t('publicCatalogueNotice')}</div>}
    <form className="search-box library-search" onSubmit={runSearch}><Search size={19} /><input id="archive-search" name="q" defaultValue={q} placeholder={t('librarySearch')} aria-label={t('librarySearch')} /><button className="button button-pop">{t('search')}</button></form>
    {response && <div className="library-truth"><span className="status-dot" />{t('catalogCoverage', { indexed: response.facets.indexed_count.toLocaleString(), catalogued: response.facets.catalogued_count.toLocaleString() })}</div>}
    <div className="library-controls">
      <div className="library-filters">
        <label>{t('sortBy')}<select value={sort} onChange={(event) => updateParam('sort', event.target.value)}>
          <option value="title_asc">{t('sortTitleAsc')}</option><option value="title_desc">{t('sortTitleDesc')}</option>
          <option value="date_desc">{t('sortNewest')}</option><option value="date_asc">{t('sortOldest')}</option>
          <option value="year_desc">{t('sortReportYearDesc')}</option><option value="year_asc">{t('sortReportYearAsc')}</option>
          <option value="expedition_asc">{t('sortExpeditionAsc')}</option><option value="expedition_desc">{t('sortExpeditionDesc')}</option>
          <option value="authors_desc">{t('sortAuthorCount')}</option>
          <option value="size_desc">{t('sortSizeDesc')}</option><option value="size_asc">{t('sortSizeAsc')}</option>
          <option value="pages_desc">{t('sortPagesDesc')}</option><option value="handle_asc">{t('sortHandle')}</option>
        </select></label>
        <label>{t('expedition')}<select value={expedition} onChange={(event) => updateParam('expedition', event.target.value)}><option value="">{t('allExpeditions')}</option>{(response?.facets.expeditions || []).map((n) => <option key={n} value={n}>{n}{ordinalSuffix(n)}</option>)}</select></label>
        <label>{t('reportYear')}<select value={year} onChange={(event) => updateParam('year', event.target.value)}><option value="">{t('allYears')}</option>{(response?.facets.years || []).map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
        <label>{t('scientificDomain')}<select value={domain} onChange={(event) => updateParam('domain', event.target.value)}><option value="">{t('allDomains')}</option>{(response?.facets.domains || []).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label>{t('reportType')}<select value={reportType} onChange={(event) => updateParam('report_type', event.target.value)}><option value="">{t('allReportTypes')}</option>{(response?.facets.report_types || []).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label>{t('indexStatus')}<select value={status} onChange={(event) => updateParam('status', event.target.value)}><option value="">{t('allStatuses')}</option>{!isPublicCatalogue && <option value="indexed">{t('textIndexed')}</option>}<option value="catalogued">{t('cataloguedPending')}</option></select></label>
        <label>{t('fileType')}<select value={fileType} onChange={(event) => updateParam('file_type', event.target.value)}><option value="">{t('allFileTypes')}</option><option value="PDF">PDF</option>{!isPublicCatalogue && <option value="RAR">RAR</option>}</select></label>
      </div>
      <div className="library-view-toggle" role="group" aria-label={t('libraryView')}><button className={view === 'cards' ? 'selected' : ''} aria-pressed={view === 'cards'} onClick={() => changeView('cards')}><Grid2X2 size={16} />{t('thumbnailView')}</button><button className={view === 'table' ? 'selected' : ''} aria-pressed={view === 'table'} onClick={() => changeView('table')}><Rows3 size={16} />{t('researchTable')}</button></div>
    </div>
    <div className="library-result-line"><span>{result.isLoading ? t('loading') : t('showingDocuments', { first: firstNumber, last: lastNumber, total: response?.total.toLocaleString() || 0 })}</span><span className="eyebrow">{view === 'table' ? t('research') : t('discover')}</span></div>
    {result.isError ? <ErrorNotice message={t('offline')} /> : result.isLoading ? <div className="library-skeleton" aria-hidden="true"><span /><span /><span /><span /></div> : response?.items.length ? view === 'cards' ? <div className="library-card-grid">{response.items.map((item) => <LibraryCard key={item.id} item={item} t={t} />)}</div> : <div className="table-scroll"><table className="records-table library-table"><thead><tr><th>{t('document')}</th><th>{t('handle')}</th><th>{t('reportYear')}</th><th>{t('issueDate')}</th><th>{t('expedition')}</th><th>{t('scientificDomain')}</th><th>{t('reportType')}</th><th>{t('pages')}</th><th>{t('fileSize')}</th><th>{t('indexStatus')}</th><th>{t('access')}</th></tr></thead><tbody>{response.items.map((item) => <tr key={item.id}><td className="library-table-title"><a href={item.preview_url || item.download_url} target="_blank" rel="noreferrer"><strong>{item.title}</strong></a><small>{item.authors || t('authorsNotListed')}{item.author_count ? ` · ${item.author_count} ${t('authors').toLowerCase()}` : ''}{item.lead_institution ? ` · ${item.lead_institution}` : ''}</small></td><td className="mono">{item.handle}</td><td>{item.year || '—'}</td><td>{issueDate(item.issue_date)}</td><td>{item.expedition ? `${item.expedition}${ordinalSuffix(item.expedition)}` : '—'}</td><td>{item.scientific_domain || '—'}</td><td>{item.report_type || item.file_type}</td><td>{item.page_count || item.page_range || '—'}</td><td>{fileSize(item.size_bytes)}</td><td><IndexStatus status={item.index_status} t={t} /></td><td><div className="library-table-actions"><a className="text-link" href={item.preview_url || item.download_url} target="_blank" rel="noreferrer">{item.file_type === 'PDF' ? t('openPdf') : t('downloadArchive')} <ArrowRight size={14} /></a><a className="library-table-download" href={isPublicCatalogue ? item.source_url : item.download_url} target="_blank" rel="noreferrer" aria-label={t(isPublicCatalogue ? 'viewSourcePage' : 'downloadDocument')}>{isPublicCatalogue ? <ExternalLink size={14} /> : <Download size={14} />}{isPublicCatalogue && t('viewSourcePage')}</a>{!isPublicCatalogue && <Link className="post-link" aria-label={`${t('openStoryForge')}: ${item.title}`} to={`/studio/${item.id}`}><Send size={14} />{t('post')}</Link>}</div></td></tr>)}</tbody></table></div> : <div className="empty-state"><BookOpen size={24} /><p>{t('noLibraryResults')}</p><span>{t('checkArchivePath')}</span></div>}
    {response && pageCount > 1 && <nav className="library-pagination" aria-label={t('documentPages')}><button className="button-outline" disabled={page <= 1} onClick={() => updateParam('page', String(page - 1))}><ChevronLeft size={16} />{t('previous')}</button><span>{t('paginationLabel', { page, pageCount })}</span><button className="button-outline" disabled={page >= pageCount} onClick={() => updateParam('page', String(page + 1))}>{t('next')}<ChevronRight size={16} /></button></nav>}
  </main>;
}

type StationProfile = {
  id: string; name: string; region: 'antarctic' | 'arctic'; place: string; coordinates: string; since: string;
  summary: string; image: string; alt: string; imageNote: string; credit: string; creditUrl: string; license: string; licenseUrl: string;
  source: string; sourceUrl: string; focus: string[];
};

const stationProfiles: StationProfile[] = [
  {
    id: 'maitri', name: 'Maitri', region: 'antarctic', place: 'maitriPlace',
    coordinates: '70°45′52″ S · 11°44′03″ E', since: '1989',
    summary: 'maitriStationSummary',
    image: `${import.meta.env.BASE_URL}images/hero/maitri_station.webp`, alt: 'maitriPhotoAlt', imageNote: 'maitriImageNote',
    credit: 'Ministry of Science & Technology, Government of India', creditUrl: 'https://commons.wikimedia.org/wiki/File:An_aerial_view_of_the_Indian_Station_Maitri,_Antarctica_on_February_2,_2005.jpg', license: 'GODL-India', licenseUrl: 'https://data.gov.in/sites/default/files/Gazette_Notification_OGDL.pdf',
    source: 'NCPOR · Maitri', sourceUrl: 'https://ncpor.res.in/antarcticas/display/176-maitri',
    focus: ['Atmospheric & Space Sciences', 'Earth Sciences & Glaciology', 'Biological & Environmental Sciences'],
  },
  {
    id: 'bharati', name: 'Bharati', region: 'antarctic', place: 'bharatiPlace',
    coordinates: '69°24.41′ S · 76°11.72′ E', since: '2012',
    summary: 'bharatiStationSummary',
    image: `${import.meta.env.BASE_URL}images/hero/bharati_station_arch2o.jpg?v=2`, alt: 'bharatiPhotoAlt', imageNote: 'bharatiImageNote',
    credit: 'Stephen Hudson', creditUrl: 'https://commons.wikimedia.org/wiki/File:AntarcticaDomeCSnow.jpg', license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    source: 'NCPOR · Bharati', sourceUrl: 'https://ncpor.res.in/pages/display/377-bharati',
    focus: ['Earth Sciences & Glaciology', 'Biological & Environmental Sciences', 'Atmospheric & Space Sciences'],
  },
  {
    id: 'himadri', name: 'Himadri', region: 'arctic', place: 'himadriPlace',
    coordinates: '78°55′ N · 11°56′ E', since: '2008',
    summary: 'himadriStationSummary',
    image: `${import.meta.env.BASE_URL}images/hero/himadri_station.webp`, alt: 'himadriPhotoAlt', imageNote: 'himadriImageNote',
    credit: 'Lekhraj Saini · Imaggeo / EGU', creditUrl: 'https://imaggeo.egu.eu/view/18921/', license: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    source: 'NCPOR · Himadri', sourceUrl: 'https://www.ncpor.res.in/app/webroot/pages/view/340-himadri-station',
    focus: ['Atmospheric sciences', 'Marine ecosystems', 'Pollution'],
  },
];

function StationsPage() {
  const { t } = useTranslation();
  const [region, setRegion] = useState<'all' | 'antarctic' | 'arctic'>('all');
  const [query, setQuery] = useState('');
  const directory = useQuery({ queryKey: ['stations'], queryFn: () => api<StationDirectory>('/api/stations') });
  const counts = directory.data?.stations ?? [];
  const shown = stationProfiles.filter((station) => {
    const matchesRegion = region === 'all' || station.region === region;
    const haystack = `${station.name} ${t(station.place)} ${t(station.summary)} ${station.focus.join(' ')}`.toLowerCase();
    return matchesRegion && haystack.includes(query.trim().toLowerCase());
  });
  const linkedReports = counts.reduce((sum, station) => sum + station.document_count, 0);
  return <main id="main" className="page-wrap stations-page dashboard-enter">
    <div className="dashboard-kicker"><span className="kicker-icon"><MapPin size={15} /></span>{t('stationDashboardKicker')}</div>
    <div className="dashboard-title-row"><div><h1>{t('stationsTitle')}</h1><p>{t('stationsIntro')}</p></div><span className="dashboard-index">POLAR FIELD GUIDE <i>·</i> 01—03</span></div>
    <div className="station-summary-bar">
      <div><span className="summary-value">03</span><span>{t('stationsAcrossRegions')}</span></div>
      <div><span className="summary-value">02</span><span>{t('polarRegions')}</span></div>
      <div><span className="summary-value">{directory.isLoading ? '—' : directory.isError ? '—' : linkedReports.toLocaleString()}</span><span>{t('stationReportLinks')}</span></div>
      <p>{t('stationDataNote')}</p>
    </div>
    <div className="station-explorer-tools">
      <div className="station-region-tabs" role="group" aria-label={t('filterStations')}>
        {(['all', 'antarctic', 'arctic'] as const).map((value) => <button key={value} className={region === value ? 'active' : ''} aria-pressed={region === value} onClick={() => setRegion(value)}>{t(value === 'all' ? 'allStations' : value === 'antarctic' ? 'antarctica' : 'arctic')}</button>)}
      </div>
      <label className="station-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('stationSearch')} aria-label={t('stationSearch')} />{query && <button type="button" onClick={() => setQuery('')} aria-label={t('clear')}><span aria-hidden="true">×</span></button>}</label>
    </div>
    {directory.isError && <ErrorNotice message={t('stationDataUnavailable')} />}
    {!shown.length ? <div className="station-empty"><Snowflake size={24} /><p>{t('noStationMatches')}</p></div> : <div className="station-grid">{shown.map((profile, index) => <StationCard key={profile.id} profile={profile} data={counts.find((item) => item.id === profile.id)} index={index} t={t} />)}</div>}
    <aside className="station-source-note"><ShieldCheck size={17} /><p>{t('stationSourceNote')}</p><a href="https://ncpor.res.in/" target="_blank" rel="noreferrer">{t('visitNcpor')} <ExternalLink size={13} /></a></aside>
  </main>;
}

function StationCard({ profile, data, index, t }: { profile: StationProfile; data?: StationDirectory['stations'][number]; index: number; t: (key: string, options?: Record<string, unknown>) => string }) {
  const themes = data?.domains.length ? data.domains.map((item) => item.name) : profile.focus;
  return <article className="station-card" style={{ '--card-order': index } as React.CSSProperties}>
    <div className="station-card-image"><img src={profile.image} alt={t(profile.alt)} loading="lazy" /><span className={`region-pill ${profile.region}`}>{t(profile.region === 'antarctic' ? 'antarctica' : 'arctic')}</span><span className="station-since">{t('operatingSince')} {profile.since}</span><div className="station-image-caption">{t(profile.imageNote)}</div></div>
    <div className="station-card-content">
      <div className="station-name-row"><div><span className="eyebrow">{t(profile.region === 'antarctic' ? 'antarcticProgramme' : 'arcticProgramme')}</span><h2>{profile.name}</h2></div><span className="station-marker"><MapPin size={16} /></span></div>
      <p className="station-place">{t(profile.place)}</p><p className="station-coordinates mono">{profile.coordinates}</p>
      <p className="station-description">{t(profile.summary)}</p>
      <div className="station-focus"><span className="eyebrow"><Microscope size={13} />{t(data?.domains.length ? 'themesFromArchive' : 'themesFromOfficialSource')}</span><div className="focus-chips">{themes.map((focus) => <span key={focus}>{t(focus === 'Atmospheric & Space Sciences' || focus === 'Atmospheric sciences' ? 'stationAtmospheric' : focus === 'Earth Sciences & Glaciology' ? 'stationEarth' : focus === 'Biological & Environmental Sciences' ? 'stationBiological' : focus === 'Marine ecosystems' ? 'stationMarine' : focus === 'Pollution' ? 'stationPollution' : focus)}</span>)}</div></div>
      <div className="station-research-head"><div><span className="eyebrow">{t('linkedArchiveResearch')}</span><strong>{data ? data.document_count.toLocaleString() : '—'} <small>{t('reports')}</small></strong></div><span className="station-match-note">{t('metadataMatch')}</span></div>
      {data?.recent.length ? <div className="station-report-list">{data.recent.map((record) => <article className="station-report" key={record.id}><span className="report-year">{record.year || '—'}</span><div className="station-report-info"><Link to={`/library?q=${encodeURIComponent(record.title)}`} title={record.title}>{record.title}</Link><small>{record.scientific_domain || record.report_type || record.file_type}</small></div><a className="report-open" href={record.preview_url || record.download_url} target="_blank" rel="noreferrer" aria-label={`${t('openPdf')}: ${record.title}`}>{record.file_type === 'PDF' ? <FileText size={16} /> : <Download size={16} />}</a></article>)}</div> : <div className="station-no-reports"><p>{t('noStationReports')}</p><Link to="/library">{t('browseArchive')} <ArrowRight size={14} /></Link></div>}
      <div className="station-card-footer"><span className="photo-source">{profile.creditUrl && <><a href={profile.creditUrl} target="_blank" rel="noreferrer">{t('photoAndImageCredit')}: {profile.credit} <ExternalLink size={12} /></a><a href={profile.licenseUrl} target="_blank" rel="noreferrer">{profile.license}</a></>}</span><a className="station-official-link" href={profile.sourceUrl} target="_blank" rel="noreferrer">{t('officialStationProfile')} <ExternalLink size={13} /></a></div>
    </div>
  </article>;
}

function LearnPage() {
  const { t } = useTranslation();
  const lang = usePreferences((state) => state.lang);
  const [activeTag, setActiveTag] = useState('all');
  const topics = lessons[lang];
  const tags = [...new Set(topics.map((topic) => topic.tag))];
  const visible = activeTag === 'all' ? topics : topics.filter((topic) => topic.tag === activeTag);
  return <main id="main" className="page-wrap learn-page dashboard-enter">
    <div className="dashboard-kicker learn-kicker"><span className="kicker-icon"><GraduationCap size={16} /></span>{t('learnDashboardKicker')}</div>
    <div className="dashboard-title-row learn-title"><div><h1>{t('learnTitle')}</h1><p>{t('learnIntro')}</p></div><span className="learn-stamp"><span>PRISM</span>{t('forCuriousMinds')}</span></div>
    <div className="learn-toolbar"><div className="learn-filter-label"><span className="eyebrow">{t('pickATopic')}</span><span>{t('learnTopicCount', { count: visible.length })}</span></div><div className="learn-topic-filters" role="group" aria-label={t('filterTopics')}><button className={activeTag === 'all' ? 'active' : ''} aria-pressed={activeTag === 'all'} onClick={() => setActiveTag('all')}>{t('allTopics')}</button>{tags.map((tag) => <button key={tag} className={activeTag === tag ? 'active' : ''} aria-pressed={activeTag === tag} onClick={() => setActiveTag(tag)}>{tag}</button>)}</div></div>
    <div className="learn-grid">{visible.map((topic, index) => <LearnCard key={topic.id} topic={topic} index={index} t={t} />)}</div>
    <aside className="learn-credit-panel"><div className="learn-credit-icon"><BookOpen size={19} /></div><div><span className="eyebrow">{t('learningCredits')}</span><h2>{t('creditsHeading')}</h2><p>{t('creditsBody')}</p><div className="learn-credit-links"><a href="https://discoveringantarctica.org.uk/" target="_blank" rel="noreferrer">Discovering Antarctica · Royal Geographical Society (with IBG) <ExternalLink size={13} /></a><a href="https://www.sciencelearn.org.nz/topics/antarctica" target="_blank" rel="noreferrer">Science Learning Hub · University of Waikato <ExternalLink size={13} /></a></div></div></aside>
  </main>;
}

function LearnCard({ topic, index, t }: { topic: LearnTopic; index: number; t: (key: string, options?: Record<string, unknown>) => string }) {
  const related = useQuery({ queryKey: ['learn-related', topic.id], queryFn: () => api<LibraryResponse>(`/api/library?q=${encodeURIComponent(topic.search)}&page_size=3&sort=year_desc`) });
  const Icon = topic.id === 'food-webs' ? Waves : topic.id === 'field-science' ? FlaskConical : topic.id === 'polar-climate' ? Wind : topic.id === 'ice-sheets' ? Layers3 : Snowflake;
  return <article className="learn-card" style={{ '--card-order': index } as React.CSSProperties}>
    <header className="learn-card-top"><span className="lesson-icon"><Icon size={22} /></span><div><span className="lesson-tag">{topic.tag}</span><span className="lesson-time">{topic.minutes}</span></div><span className="lesson-number">{String(index + 1).padStart(2, '0')}</span></header><span className="lesson-route" aria-hidden="true"><i /><i /><i /></span>
    <h2>{topic.title}</h2><p className="lesson-summary">{topic.summary}</p>
    <section className="lesson-activity"><span className="eyebrow"><Sparkles size={13} />{t('tryThis')}</span><p>{topic.activity}</p></section>
    <div className="lesson-question"><span className="question-mark">?</span><p><strong>{t('thinkAboutIt')}</strong>{topic.question}</p></div>
    <div className="lesson-sources"><span className="eyebrow">{t('learnFromSources')}</span>{topic.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer"><span><strong>{source.title}</strong><small>{source.organization}</small></span><ExternalLink size={14} /></a>)}</div>
    <section className="lesson-reports"><div className="lesson-reports-heading"><span className="eyebrow"><FileText size={13} />{t('relatedPrismReports')}</span><span className="local-tag">{t('localArchive')}</span></div>
      {related.isLoading ? <p className="related-state">{t('findingReports')}</p> : related.data?.items.length ? related.data.items.slice(0, 2).map((item) => <article className="lesson-report" key={item.id}><span className="lesson-report-year">{item.year || '—'}</span><div><a href={item.preview_url || item.download_url} target="_blank" rel="noreferrer">{item.title}</a><small>{item.scientific_domain || item.report_type || item.handle}</small></div><Link to={`/library?q=${encodeURIComponent(topic.search)}`} aria-label={t('browseRelatedReports')}><ArrowRight size={14} /></Link></article>) : <p className="related-state">{related.isError ? t('relatedReportsOffline') : t('noRelatedReports')}</p>}
    </section>
    <div className="lesson-original-note">{t('originalSummaryNote')}</div>
  </article>;
}

function IndexStatus({ status, t }: { status: string; t: (key: string) => string }) {
  return <span className={`index-status ${status === 'indexed' ? 'is-indexed' : ''}`}><i />{status === 'indexed' ? t('textIndexed') : t('cataloguedPending')}</span>;
}

function LibraryCard({ item, t }: { item: LibraryItem; t: (key: string, options?: Record<string, unknown>) => string }) {
  return <article className="library-card">
    <a className="library-cover" href={item.preview_url || item.download_url} target="_blank" rel="noreferrer" aria-label={`${t(item.file_type === 'PDF' ? 'openPdf' : 'downloadArchive')}: ${item.title}`}>
      <LibraryCover item={item} /><span className="cover-format">{item.file_type}</span>
    </a>
    <div className="library-card-body"><div className="library-card-meta"><span className="mono">{item.handle}</span><IndexStatus status={item.index_status} t={t} /></div>
      <h2><a href={item.preview_url || item.download_url} target="_blank" rel="noreferrer">{item.title}</a></h2>
      <p className="library-authors">{item.authors || t('authorsNotListed')}</p>
      {(item.scientific_domain || item.report_type) && <p className="library-classification">{item.scientific_domain}{item.scientific_domain && item.report_type ? ' · ' : ''}{item.report_type}</p>}
      <div className="library-facts"><span>{item.year || issueDate(item.issue_date)}</span><span>{item.expedition ? `${item.expedition}${ordinalSuffix(item.expedition)}` : t('expeditionUnknown')}</span><span>{item.page_count ? `${item.page_count} ${t('pagesShort')}` : item.page_range ? `${t('pageRange')} ${item.page_range}` : t('pagesPending')}</span><span>{item.author_count ? `${item.author_count} ${t('authors').toLowerCase()}` : fileSize(item.size_bytes)}</span></div>
      <div className="library-card-actions"><a className="button-outline" href={item.preview_url || item.download_url} target="_blank" rel="noreferrer"><BookOpen size={15} />{item.file_type === 'PDF' ? t('openPdf') : t('downloadArchive')}</a><a className="library-download" href={isPublicCatalogue ? item.source_url : item.download_url} target="_blank" rel="noreferrer" aria-label={t(isPublicCatalogue ? 'viewSourcePage' : 'downloadDocument')}>{isPublicCatalogue ? <ExternalLink size={15} /> : <Download size={15} />}{isPublicCatalogue && <span>{t('viewSourcePage')}</span>}</a>{!isPublicCatalogue && <Link className="post-button button-outline" aria-label={`${t('openStoryForge')}: ${item.title}`} to={`/studio/${item.id}`}><Send size={15} />{t('post')}</Link>}{item.record_id && <Link className="library-evidence-link" to={`/records/${item.record_id}`}>{t('evidenceReader')} <ArrowRight size={13} /></Link>}</div>
    </div>
  </article>;
}

type PostChannel = 'linkedin' | 'instagram' | 'x';

function composeOutreach(source: OutreachSource, quote: string, pageNo: number | null, channel: PostChannel, language: 'en' | 'hi') {
  if (!quote || pageNo === null) {
    return language === 'hi'
      ? `PRISM ध्रुवीय विज्ञान अभिलेख से।\n\n${source.title}\n\nहैंडल: ${source.handle}\nमूल दस्तावेज़ उपलब्ध है; पृष्ठ-पाठ अभी अनुक्रमित नहीं है।`
      : `From the PRISM polar science archive.\n\n${source.title}\n\nHandle: ${source.handle}\nThe original document is available; page text is not indexed yet.`;
  }
  const heading = language === 'hi' ? 'ध्रुवीय विज्ञान अभिलेख से।' : 'Polar science, directly from the archive.';
  const citation = language === 'hi'
    ? `स्रोत अंग्रेज़ी में: ${source.handle} · PDF पृष्ठ ${pageNo}`
    : `Source: ${source.handle} · PDF page ${pageNo}`;
  if (channel === 'x') return `${source.title}: “${quote}” [${source.handle} p.${pageNo}]`;
  if (channel === 'instagram') return `${heading}\n\n${source.title}\n\n“${quote}”\n\n${citation}\n#PolarScience #Antarctica`;
  return `${heading}\n\n${source.title}\n\n“${quote}”\n\n${citation}`;
}

function OutreachStudio() {
  const { t } = useTranslation();
  const { libraryId = '' } = useParams();
  const [studioParams] = useSearchParams();
  const isGalleryPost = libraryId === 'gallery';
  const galleryImage = studioParams.get('image') || '';
  const galleryPostSource: OutreachSource | undefined = isGalleryPost ? { id: 'gallery', record_id: null, handle: 'PRISM GALLERY', title: studioParams.get('title') || 'PRISM Gallery image', authors: 'PRISM Gallery', issue_date: null, expedition: null, file_type: 'IMAGE', index_status: 'catalogued', claims: [], note: 'Gallery imagery is presented as visual source material; add context before posting.' } : undefined;
  const [step, setStep] = useState(1);
  const [channel, setChannel] = useState<PostChannel>('linkedin');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [claimId, setClaimId] = useState('');
  const [draft, setDraft] = useState('');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const source = useQuery({ queryKey: ['outreach-source', libraryId], queryFn: () => api<OutreachSource>(`/api/library/${libraryId}/outreach`), enabled: Boolean(libraryId) && !isGalleryPost, initialData: galleryPostSource });
  const indexDocument = useMutation({
    mutationFn: () => api(`/api/library/${libraryId}/index`, { method: 'POST' }),
    onSuccess: () => { void source.refetch(); },
  });
  useEffect(() => {
    if (source.data?.claims.length && !source.data.claims.some((claim) => claim.id === claimId)) setClaimId(source.data.claims[0].id);
  }, [source.data, claimId]);
  const claim = source.data?.claims.find((item) => item.id === claimId);
  const generated = useMemo(() => source.data ? composeOutreach(source.data, claim?.quote || '', claim?.page_no ?? null, channel, language) : '', [source.data, claim, channel, language]);
  useEffect(() => { setDraft(generated); setCopied(false); setCopyError(false); }, [generated]);
  const isEdited = Boolean(generated && draft !== generated);
  const xTooLong = channel === 'x' && draft.length > 280;
  const copyDraft = async () => {
    try { await navigator.clipboard.writeText(draft); setCopied(true); setCopyError(false); }
    catch { setCopyError(true); }
  };
  const steps = [t('sourceAndQuote'), t('templateAndEdit'), t('reviewAndCopy')];
  return <main id="main" className="page-wrap studio-page">
    <div className="eyebrow"><Link to="/library">{t('library')}</Link> / {t('outreachStudio')}</div>
    <div className="studio-title"><div><h1>{t('outreachStudio')}</h1><p>{t('outreachIntro')}</p></div><span className="studio-mode"><ShieldCheck size={15} />{t('deterministicMode')}</span></div>
    <ol className="studio-steps">{steps.map((label, index) => <li className={step === index + 1 ? 'active' : step > index + 1 ? 'done' : ''} key={label}><span>{String(index + 1).padStart(2, '0')}</span>{label}</li>)}</ol>
    {source.isError ? <ErrorNotice message={t('outreachSourceMissing')} /> : source.isLoading ? <p>{t('loading')}</p> : source.data && <>
      {step === 1 && <section className="studio-source-grid"><article className="studio-source-card"><span className="eyebrow">{t('sourceDocument')}</span><Provenance type={source.data.index_status === 'indexed' ? 'OFFICIAL ARCHIVE' : 'OFFICIAL ARCHIVE'} />{isGalleryPost && galleryImage && <img className="studio-gallery-source" src={galleryImage} alt="Selected gallery image" />}<h2>{source.data.title}</h2><p className="mono">{source.data.handle} · {source.data.file_type}</p>{source.data.authors && <p className="muted">{source.data.authors}</p>}{!isGalleryPost && <a className="text-link" href={source.data.file_type === 'PDF' ? `/api/library/${source.data.id}/preview` : `/api/library/${source.data.id}/download`} target="_blank" rel="noreferrer">{t('openSourceDocument')} <ArrowRight size={14} /></a>}</article>
        <div className="studio-claims"><div className="studio-section-heading"><div><span className="eyebrow">{t('stepOne')}</span><h2>{t('selectExactQuote')}</h2></div><span className="mono">{source.data.claims.length} {t('verifiedCandidates')}</span></div>
          {source.data.claims.length ? <div className="claim-list">{source.data.claims.map((candidate) => <label className={`claim-option ${claimId === candidate.id ? 'selected' : ''}`} key={candidate.id}><input type="radio" name="claim" value={candidate.id} checked={claimId === candidate.id} onChange={() => setClaimId(candidate.id)} /><span className="claim-option-copy"><span>{candidate.quote}</span><small>{t('page')} {candidate.page_no}{candidate.printed_page ? ` · ${t('printed')} ${candidate.printed_page}` : ''} · {t('exactQuote')}</small></span></label>)}</div> : <><div className="notice notice-warn"><FileText size={16} />{source.data.note || t('noQuoteCandidates')}</div>{!isGalleryPost && source.data.file_type === 'PDF' && <div className="studio-actions"><button className="button button-pop" disabled={indexDocument.isPending} onClick={() => indexDocument.mutate()}>{indexDocument.isPending ? t('indexingDocument') : t('indexDocument')}</button>{indexDocument.isError && <p className="copy-error" role="status">{t('indexFailed')}</p>}</div>}</>}
          <div className="studio-actions"><span className="source-language-note">{t('sourceEnglish')}</span></div>
        </div>
      </section>}
      {step === 2 && <section className="studio-editor-grid"><div className="studio-editor-controls"><span className="eyebrow">{t('stepTwo')}</span><h2>{t('chooseOutreachFormat')}</h2><fieldset className="channel-options"><legend>{t('channel')}</legend>{(['linkedin','instagram','x'] as PostChannel[]).map((item) => <label className={channel === item ? 'selected' : ''} key={item}><input type="radio" name="channel" checked={channel === item} onChange={() => setChannel(item)} /><span>{t(item)}</span></label>)}</fieldset><label className="studio-language">{t('draftLanguage')}<select value={language} onChange={(event) => setLanguage(event.target.value as 'en' | 'hi')}><option value="en">English</option><option value="hi">हिन्दी</option></select></label><div className="notice notice-info"><ShieldCheck size={16} /><span>{claim ? t('onlyExactSourceQuote') : t('metadataOnlyPost')}</span></div></div>
        <div className="studio-preview"><div className="studio-section-heading"><div><span className="eyebrow">{t('livePreview')}</span><h2>{t('editPostCopy')}</h2></div><span className="mono">{draft.length}{channel === 'x' ? ' / 280' : ` ${t('characters')}`}</span></div><label className="sr-only" htmlFor="post-draft">{t('editPostCopy')}</label><textarea id="post-draft" value={draft} onChange={(event) => { setDraft(event.target.value); setCopied(false); }} rows={14} /><div className="studio-review-markers">{claim && <span className="claim-badge"><ShieldCheck size={14} />{t('exactQuote')}</span>}{isEdited && <span className="review-badge">{t('needsHumanReview')}</span>}{!claim && <span className="review-badge">{t('metadataOnly')}</span>}</div></div>
      </section>}
      {step === 3 && <section className="studio-review"><div><span className="eyebrow">{t('stepThree')}</span><h2>{t('reviewBeforePosting')}</h2><p>{t('copyOnlyNotice')}</p><div className="checklist-row"><ShieldCheck size={18} /><span>{claim ? `${t('exactQuote')} · ${t('page')} ${claim.page_no} · ${source.data.handle}` : t('metadataOnlyPost')}</span></div><div className="checklist-row"><ShieldCheck size={18} /><span>{t('originalLinkIncluded')}</span></div>{isEdited && <div className="notice notice-warn review-required">{t('editedNeedsReview')}</div>}{xTooLong && <div className="notice notice-warn">{t('xLimitWarning')}</div>}</div><div className="studio-final-copy"><span className="eyebrow">{t('postPreview')}</span><pre>{draft}</pre><div className="studio-actions"><button className="button button-pop" disabled={!draft.trim() || xTooLong} onClick={() => void copyDraft()}><Copy size={15} />{copied ? t('copied') : t('copyPost')}</button></div>{copyError && <p className="copy-error" role="status">{t('copyFailed')}</p>}</div></section>}
      <div className="studio-bottom-nav">{step > 1 && <button className="text-link" onClick={() => setStep(step - 1)}><ArrowLeft size={15} />{t('back')}</button>}{step < 3 && <button className="button button-pop" onClick={() => setStep(step + 1)}>{step === 1 ? t('continue') : t('reviewPost')} <ArrowRight size={15} /></button>}</div>
    </>}
  </main>;
}

function ordinalSuffix(n: number) { return n % 100 >= 11 && n % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] || 'th'; }

function HighlightedSnippet({ text }: { text?: string }) {
  return <span className="snippet">{snippetParts(text).map((part, index) => part.marked ? <mark key={index}>{part.text}</mark> : <span key={index}>{part.text}</span>)}</span>;
}

function Explore() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const expedition = params.get('expedition') || '';
  const year = params.get('year') || '';
  const mode = usePreferences((s) => s.mode);
  const archive = useQuery({ queryKey: ['records', 'facets'], queryFn: () => api<{ records: RecordItem[] }>('/api/records') });
  const searchParams = new URLSearchParams({ q });
  if (expedition) searchParams.set('expedition', expedition);
  if (year) { searchParams.set('year_from', year); searchParams.set('year_to', year); }
  const result = useQuery({ queryKey: ['search', q, expedition, year], queryFn: () => api<SearchResponse>(`/api/search?${searchParams}`), enabled: true });
  const runSearch = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); setParams((prev) => { const next = new URLSearchParams(prev); const value = String(form.get('q') || '').trim(); if (value) next.set('q', value); else next.delete('q'); return next; }); };
  const setFacet = (name: string, value: string) => setParams((prev) => { const next = new URLSearchParams(prev); if (value) next.set(name, value); else next.delete(name); return next; });
  const expeditions = [...new Set((archive.data?.records || []).map((record) => record.expedition).filter((n): n is number => n !== null))].sort((a, b) => a - b);
  const years = [...new Set((archive.data?.records || []).map((record) => record.year).filter((n): n is number => n !== null))].sort((a, b) => a - b);
  return <main id="main" className="page-wrap explore-page">
    <div className="eyebrow">PRISM / {t('explore')}</div><h1>{t('readPassages')}</h1>
    <form className="search-box" onSubmit={runSearch}><Search size={19} /><input id="archive-search" name="q" defaultValue={q} placeholder={t('searchPlaceholder')} aria-label={t('searchPlaceholder')} /><button className="button button-pop">{t('search')}</button></form>
    <div className="facets"><label>{t('expedition')}<select value={expedition} onChange={(event) => setFacet('expedition', event.target.value)}><option value="">{t('allExpeditions')}</option>{expeditions.map((item) => <option key={item} value={item}>{item}{ordinalSuffix(item)}</option>)}</select></label><label>{t('year')}<select value={year} onChange={(event) => setFacet('year', event.target.value)}><option value="">{t('allYears')}</option>{years.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><span className="facet-count">{archive.data?.records.length ?? 0} {t('records')}</span></div>
    <div className="result-head"><span>{q ? `${result.data?.total ?? '—'} ${t('matchingPassages')} · “${q}”` : t('allRecords')}</span><span className="eyebrow">{mode === 'research' ? t('research') : t('discover')} {t('view')}</span></div>
    {result.isError ? <ErrorNotice message={t('offline')} /> : result.isLoading ? <p className="muted">{t('loading')}</p> : result.data?.results.length ? mode === 'research' ? <div className="table-scroll"><table className="records-table"><thead><tr><th>{t('titlePassage')}</th><th>{t('handle')}</th><th>{t('year')}</th><th>{t('pages')}</th><th>{t('source')}</th></tr></thead><tbody>{result.data.results.map((record) => <tr key={`${record.id}-${record.page_no}`}><td><Link to={`/records/${record.id}?page=${record.page_no || 1}&q=${encodeURIComponent(q)}`}><strong>{record.title}</strong></Link><small><HighlightedSnippet text={record.snippet} /></small></td><td className="mono">{record.handle}</td><td>{record.year || '—'}</td><td>{record.page_no ? `${record.page_no} / ${record.page_count}` : record.page_count}</td><td><Provenance type={record.provenance} /></td></tr>)}</tbody></table></div> : <div className="search-results">{result.data.results.map((record) => <article className="result-card" key={`${record.id}-${record.page_no}`}><div className="result-top"><Provenance type={record.provenance} /><span className="mono">{record.handle}</span></div><h2><Link to={`/records/${record.id}?page=${record.page_no || 1}&q=${encodeURIComponent(q)}`}>{record.title}</Link></h2><p className="result-snippet"><HighlightedSnippet text={record.snippet} /></p><div className="result-bottom"><span>{record.page_no ? `${t('page')} ${record.page_no}` : `${record.page_count} ${t('pagesShort')}`}{record.year ? ` · ${record.year}` : ''}</span><Link to={`/records/${record.id}?page=${record.page_no || 1}&q=${encodeURIComponent(q)}`}>{t('openRecord')} <ArrowRight size={14} /></Link></div></article>)}</div> : <div className="empty-state"><Search size={23} /><p>{q ? t('noResults') : t('nothingIngested')}</p><Link to="/status">{t('viewStatus')}</Link></div>}
  </main>;
}

function Reader() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const { id = '' } = useParams();
  const pageNo = Math.max(1, Number(params.get('page') || 1));
  const passage = params.get('q') || '';
  const record = useQuery({ queryKey: ['record', id], queryFn: () => api<RecordItem & { pages: { page_no: number; printed_page: string | null; ocr: boolean }[] }>(`/api/records/${id}`), enabled: Boolean(id) });
  const page = useQuery({ queryKey: ['page', id, pageNo], queryFn: () => api<{ text: string; image_url: string; printed_page: string | null; ocr: boolean }>(`/api/records/${id}/pages/${pageNo}`), enabled: Boolean(id) });
  const rects = useQuery({ queryKey: ['highlight', id, pageNo, passage], queryFn: () => api<{ rects: number[][]; matched_ratio: number }>(`/api/records/${id}/pages/${pageNo}/highlight?passage=${encodeURIComponent(passage)}`), enabled: Boolean(passage && id) });
  const total = record.data?.page_count || 1;
  const goPage = (n: number) => setParams((prev) => { prev.set('page', String(Math.max(1, Math.min(total, n)))); return prev; });
  return <main id="main" className="page-wrap reader-page">
    {record.isError ? <ErrorNotice message={t('recordNotIndexed')} /> : record.isLoading ? <p>{t('loading')}</p> : record.data && <>
      <div className="reader-heading"><div><div className="eyebrow"><Link to="/explore">{t('explore')}</Link> / {record.data.handle}</div><h1>{record.data.title}</h1><div className="reader-meta"><Provenance type={record.data.provenance} /><span>{record.data.page_count} {t('pagesShort')}</span>{record.data.expedition && <span>{record.data.expedition}{ordinalSuffix(record.data.expedition)} Indian Antarctic Expedition</span>}</div></div><a className="button button-outline download-link" href={`/api/records/${id}/original`}><BookOpen size={16} /> {t('originalPdf')}</a></div>
      <div className="reader-layout"><section className="scan-column"><div className="scan-toolbar"><button className="button button-outline" disabled={pageNo <= 1} onClick={() => goPage(pageNo - 1)}><ArrowLeft size={15} /> {t('previous')}</button><span className="mono">{t('page')} {pageNo} / {record.data.page_count}{page.data?.printed_page ? ` · ${t('printed')} ${page.data.printed_page}` : ''}</span><button className="button button-outline" disabled={pageNo >= total} onClick={() => goPage(pageNo + 1)}>{t('next')} <ArrowRight size={15} /></button></div>
        <div className="scan-frame">{page.data && <div className="scan-wrap"><img src={page.data.image_url} alt={`Scanned original, PDF page ${pageNo}`} /><svg className="scan-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{rects.data?.rects.map((r, i) => <rect key={i} x={r[0] * 100} y={r[1] * 100} width={(r[2] - r[0]) * 100} height={(r[3] - r[1]) * 100} />)}</svg></div>}</div>
        <div className="page-text"><div className="eyebrow">{t('transcribedPage')} {pageNo}{page.data?.ocr && ' · OCR'}</div><p>{page.data?.text || t('loading')}</p></div>
      </section><aside className="reader-aside"><span className="eyebrow">{t('details')}</span><dl><dt>{t('handle')}</dt><dd className="mono">{record.data.handle}</dd><dt>{t('authors')}</dt><dd>{record.data.authors || t('notIdentified')}</dd><dt>{t('series')}</dt><dd>{record.data.series ? `Technical Publication No. ${record.data.series}` : t('notIdentified')}</dd><dt>{t('year')}</dt><dd>{record.data.year || t('notIdentified')}</dd><dt>{t('sourceFile')}</dt><dd>{record.data.filename}</dd></dl>{passage && <div className="notice notice-info"><ShieldCheck size={16} />{rects.data?.matched_ratio && rects.data.matched_ratio >= 0.75 ? t('evidenceLocated', { page: pageNo, percent: Math.round(rects.data.matched_ratio * 100) }) : t('searchingEvidence')}</div>}<Link to={`/trace/${id}/${pageNo}?q=${encodeURIComponent(passage)}`} className="text-link">{t('showTrace')} <ArrowRight size={14} /></Link><Link to={`/ask?q=${encodeURIComponent(record.data.title)}`} className="text-link">{t('ask')} <ArrowRight size={14} /></Link></aside></div>
    </>}
  </main>;
}

type ChatTurn = { role: 'user' | 'assistant'; content: string; response?: AskResponse; indexedDocument?: AssistantDocumentUpload; error?: boolean };

function loadChatTurns(): ChatTurn[] {
  try {
    const stored: unknown = JSON.parse(window.sessionStorage.getItem('prism-chat-turns') || '[]');
    if (!Array.isArray(stored)) return [];
    return stored.filter((turn): turn is ChatTurn => typeof turn === 'object' && turn !== null
      && 'role' in turn && (turn.role === 'user' || turn.role === 'assistant')
      && 'content' in turn && typeof turn.content === 'string').slice(-40);
  } catch {
    return [];
  }
}

function Ask() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const question = params.get('q') || '';
  const [draft, setDraft] = useState(question);
  const [questionError, setQuestionError] = useState('');
  const [turns, setTurns] = useState<ChatTurn[]>(loadChatTurns);
  const [copiedTurn, setCopiedTurn] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState('');
  const initialQuestionStarted = useRef(false);
  const chatVersion = useRef(0);
  const transcriptEnd = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const capabilities = useQuery({ queryKey: ['capabilities'], queryFn: () => api<Capabilities>('/api/capabilities') });
  const assistant = useMutation({
    mutationFn: (payload: { question: string; history: { role: 'user' | 'assistant'; content: string }[] }) =>
      api<AskResponse>('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, mode: 'assistant' }),
      }),
  });
  const upload = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return api<AssistantDocumentUpload>('/api/ask/documents', { method: 'POST', body: form });
    },
    onSuccess: (result) => {
      setUploadError('');
      const document = result.document;
      setTurns((current) => [...current, {
        role: 'assistant',
        content: document.display_name,
        indexedDocument: result,
      }]);
    },
    onError: () => setUploadError(t('uploadFailed')),
  });
  const onFileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      setUploadError(t('uploadTooLarge'));
      return;
    }
    setUploadError('');
    upload.mutate(file);
  };
  const sendQuestion = (rawQuestion: string) => {
    const nextQuestion = rawQuestion.trim();
    if (!nextQuestion || assistant.isPending) return;
    if (nextQuestion.length < 3) {
      setQuestionError(t('questionTooShort'));
      return;
    }
    setQuestionError('');
    initialQuestionStarted.current = true;
    const history = historyFromTurns(turns);
    const requestVersion = chatVersion.current;
    setTurns((current) => [...current, { role: 'user', content: nextQuestion }]);
    setDraft('');
    setParams({ q: nextQuestion });
    assistant.mutate({ question: nextQuestion, history }, {
      onSuccess: (response) => {
        if (requestVersion !== chatVersion.current) return;
        setTurns((current) => [...current, {
          role: 'assistant',
          content: response.answer ?? response.notice ?? t('noResults'),
          response,
        }]);
      },
      onError: (error) => {
        if (requestVersion !== chatVersion.current) return;
        const isHttpError = error instanceof Error && /^\d{3}:/.test(error.message);
        const invalidInput = isHttpError && /^(400|422):/.test((error as Error).message);
        setTurns((current) => [...current, invalidInput ? { role: 'assistant', content: t('askRequestFailed'), error: true } : { role: 'assistant', content: t('assistantMaintenance'), response: maintenanceResponse() }]);
      },
    });
  };
  useEffect(() => {
    if (!question || initialQuestionStarted.current) return;
    initialQuestionStarted.current = true;
    const alreadyAnswered = turns.some((turn, index) => turn.role === 'user'
      && turn.content === question
      && turns.slice(index + 1).some((nextTurn) => nextTurn.role === 'assistant'));
    if (!alreadyAnswered) sendQuestion(question);
  }, [question]);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendQuestion(draft);
  };
  const startNewChat = () => {
    chatVersion.current += 1;
    initialQuestionStarted.current = true;
    assistant.reset();
    upload.reset();
    setTurns([]);
    setDraft('');
    setQuestionError('');
    setUploadError('');
    setCopiedTurn(null);
    window.sessionStorage.removeItem('prism-chat-turns');
    setParams({});
  };
  const copyAnswer = async (index: number, answer: string) => {
    try {
      await navigator.clipboard.writeText(answer);
      setCopiedTurn(index);
      window.setTimeout(() => setCopiedTurn(null), 1600);
    } catch {
      setCopiedTurn(null);
    }
  };
  useEffect(() => {
    try {
      window.sessionStorage.setItem('prism-chat-turns', JSON.stringify(turns));
    } catch {
      return;
    }
  }, [turns]);
  useEffect(() => {
    transcriptEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns, assistant.isPending]);

  return <main id="main" className="page-wrap ask-page chat-page">
    <div className="eyebrow">PRISM / CHAT ASSISTANT</div><h1>{t('ask')}</h1>
    <div className="ask-shell chat-shell">
      <div className="ask-intro"><span className="ask-avatar">P</span><div className="chat-identity"><strong>{t('localAssistant')}</strong><p>{capabilities.data?.assistant ? t('assistantModeLocal') : t('assistantModePassages')}</p></div><button type="button" className="chat-new-button" onClick={startNewChat} title={t('newChat')} aria-label={t('newChat')}><Plus size={16} /><span>{t('newChat')}</span></button></div>
      <section className="chat-log" aria-label={t('chatTranscript')} aria-live="polite">
        <div className="chat-turn chat-turn-assistant"><span className="chat-avatar" aria-hidden="true">P</span><div className="chat-bubble">{capabilities.data?.assistant ? t('chatWelcome') : t('chatFallbackWelcome')}</div></div>
        {turns.length === 0 && <div className="chat-starters"><span>{t('starterQuestions')}</span><div>{(['starterMaitri', 'starterArchive', 'starterScience'] as const).map((starter) => <button type="button" key={starter} onClick={() => sendQuestion(t(starter))}>{t(starter)}</button>)}</div></div>}
        {turns.map((turn, index) => <div className={`chat-turn chat-turn-${turn.role}`} key={`${turn.role}-${index}`}>
          {turn.role === 'assistant' && <span className="chat-avatar" aria-hidden="true">P</span>}
          <div className="chat-bubble">
            {turn.error ? <ErrorNotice message={turn.content} /> : turn.indexedDocument ? <div className="chat-indexed-file"><FileText size={18} /><span><strong>{turn.indexedDocument.document.display_name}</strong><small>{turn.indexedDocument.duplicate ? t('fileAlreadyIndexed') : t('fileIndexed')} · {turn.indexedDocument.document.kind}</small></span></div> : turn.response?.answer != null ? <AssistantAnswer answer={turn.response.status === 'maintenance' ? t('assistantMaintenance') : turn.response.answer} sources={turn.response.sources} /> : <p>{turn.content}</p>}
            {turn.response?.sources?.length ? <div className="chat-sources"><strong>{t('assistantSources')}</strong>{turn.response.sources.map((source, sourceIndex) => <div className="chat-source" key={`${source.document_name}-${source.citation}-${sourceIndex}`}><b>{source.citation}</b><span><SourceLink source={source} />{source.location && ` · ${source.location}`}</span><p>{source.excerpt}</p></div>)}</div> : null}
            {turn.response?.search_suggestions && <iframe className="chat-search-suggestions" title="Search suggestions" sandbox="allow-popups allow-popups-to-escape-sandbox" referrerPolicy="no-referrer" srcDoc={'<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; img-src https: data:">' + turn.response.search_suggestions} />}
            {turn.response?.results?.length ? <div className="chat-passages">{turn.response.results.map((record) => <article className="chat-passage" key={`${record.id}-${record.page_no}`}><div className="result-top"><Provenance type={record.provenance} /><span>{t('page')} {record.page_no}</span></div><strong>{record.title}</strong><p><HighlightedSnippet text={record.snippet} /></p><Link to={`/records/${record.id}?page=${record.page_no || 1}&q=${encodeURIComponent(record.title)}`}>{t('openHighlighted')} <ArrowRight size={14} /></Link></article>)}</div> : null}
            {turn.response?.answer === null && !turn.response.results?.length ? <p className="chat-no-results">{t('noResults')}</p> : null}
            {turn.role === 'assistant' && turn.response?.answer != null && turn.response.status !== 'maintenance' && <button type="button" className="chat-copy-button" onClick={() => void copyAnswer(index, turn.response!.answer!)} title={copiedTurn === index ? t('copied') : t('copyReply')} aria-label={copiedTurn === index ? t('copied') : t('copyReply')}>{copiedTurn === index ? <Check size={14} /> : <Copy size={14} />}{copiedTurn === index && <span>{t('copied')}</span>}</button>}
          </div>
        </div>)}
        {assistant.isPending && <div className="chat-turn chat-turn-assistant"><span className="chat-avatar" aria-hidden="true">P</span><div className="chat-bubble chat-pending">{capabilities.data?.assistant ? t('thinking') : t('searchingPassages')}</div></div>}
        <div ref={transcriptEnd} />
      </section>
      <form className={`ask-form chat-composer${capabilities.data?.document_upload ? ' has-upload-control' : ''}`} onSubmit={submit}>
        <label className="sr-only" htmlFor="question">{t('questionPlaceholder')}</label>
        <input ref={fileInput} className="chat-file-input" type="file" accept=".pdf,.docx,.txt,.md,.markdown,.csv" onChange={onFileSelected} tabIndex={-1} aria-hidden="true" />
        {capabilities.data?.document_upload && <button className="chat-attach-button" type="button" title={t('attachDocument')} aria-label={t('attachDocument')} onClick={() => fileInput.current?.click()} disabled={upload.isPending || assistant.isPending}><Paperclip size={18} /></button>}
        <textarea id="question" value={draft} maxLength={1000} aria-invalid={Boolean(questionError)} aria-describedby={questionError ? 'question-error' : 'composer-hint'} onChange={(event) => { setDraft(event.target.value); setQuestionError(''); }} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder={capabilities.data?.assistant ? t('chatPlaceholder') : t('questionPlaceholder')} rows={2} />
        {questionError && <p className="chat-input-error" id="question-error" role="alert">{questionError}</p>}
        {uploadError && <p className="chat-upload-error" role="alert">{uploadError}</p>}
        {upload.isPending && <p className="chat-upload-progress" role="status">{t('indexingFile', { name: upload.variables.name })}</p>}
        <div className="chat-composer-hint" id="composer-hint"><span>{capabilities.data?.document_upload ? t('uploadHint') : t('composerHint')}</span><span>{draft.length}/1000</span></div>
        <button className="button button-pop" type="submit" title={t('sendMessage')} aria-label={t('sendMessage')} disabled={!draft.trim() || assistant.isPending}><Send size={17} /></button>
      </form>
    </div>
  </main>;
}

function StatusPage() {
  const { t } = useTranslation();
  const status = useQuery({ queryKey: ['status'], queryFn: () => api<Status>('/api/status') });
  const data = status.data;
  return <main id="main" className="page-wrap status-page"><div className="eyebrow">PRISM / TRANSPARENCY</div><h1>{t('statusTitle')}</h1>
    {status.isError ? <ErrorNotice message={t('offline')} /> : status.isLoading ? <p>{t('loading')}</p> : data && <>
      <div className="status-summary"><ShieldCheck size={20} /><span>{t('statusHonest')}</span><Provenance type="OFFICIAL ARCHIVE" /></div>
      <div className="status-table"><div className="status-row status-head"><span>{t('service')}</span><span>{t('value')}</span></div>
        {[ [t('api'), data.api], [t('database'), data.database], [t('mailpit'), data.mailpit], [t('queue'), String(data.queue_depth)], [t('documents'), String(data.records)], [t('textIndexed'), String(data.indexed_records ?? data.records)], [t('cataloguedPending'), String(data.catalogued_records ?? 0)], [t('pages'), String(data.pages)], [t('photos'), String(data.photos)], [t('ocrCoverage'), `${data.ocr_pages} / ${data.pages}`] ].map(([name, value]) => <div className="status-row" key={name}><span>{name}</span><span className={value === 'online' ? 'status-ok' : ''}>{value}</span></div>)}
      </div><p className="status-note">{data.ai}. {t('localOnly')}.</p>
    </>}
  </main>;
}

type TraceData = { steps: { kind: string; id?: string; label: string; provenance: string; evidence?: string; evidence_page?: number; page_no?: number; why?: string }[]; record_id: string; page_no: number };
type GraphData = { nodes: { id: string; kind: string; label: string; provenance: string }[]; edges: { id: number; source: string; target: string; relation: string; record_id: string; evidence_page: number | null; evidence: string; why: string }[] };

function TracePage() {
  const { t } = useTranslation();
  const { recordId = '', pageNo = '1' } = useParams();
  const [params] = useSearchParams();
  const passage = params.get('q') || '';
  const trace = useQuery({ queryKey: ['trace', recordId, pageNo, passage], queryFn: () => api<TraceData>(`/api/trace/${recordId}/${pageNo}?q=${encodeURIComponent(passage)}`), enabled: Boolean(recordId) });
  return <main id="main" className="page-wrap trace-page"><div className="eyebrow">PRISM / {t('trace')}</div><h1>{t('evidenceTrace')}</h1><p className="muted">{t('traceIntro')}</p>
    {trace.isError ? <ErrorNotice message={t('recordNotIndexed')} /> : trace.isLoading ? <p>{t('loading')}</p> : trace.data && <ol className="trace-list">{trace.data.steps.map((step, index) => <li className="trace-step" key={`${step.kind}-${step.id || step.page_no || index}`}><span className="trace-number">{String(index + 1).padStart(2, '0')}</span><div className="trace-card"><div className="trace-card-head"><span className="eyebrow">{t(step.kind in { passage: 1, record: 1, expedition: 1, station: 1, place: 1, person: 1, institution: 1, series: 1 } ? step.kind : 'record')}</span><Provenance type={step.provenance} /></div><h2>{step.label}</h2>{step.evidence && <blockquote>{step.evidence}</blockquote>}{step.why && <p className="trace-why"><strong>{t('whyConnected')}:</strong> {step.why}{step.evidence_page ? ` · ${t('page')} ${step.evidence_page}` : ''}</p>}{step.kind === 'passage' && <Link className="text-link" to={`/records/${trace.data.record_id}?page=${trace.data.page_no}&q=${encodeURIComponent(passage)}`}>{t('openHighlighted')} <ArrowRight size={14} /></Link>}</div></li>)}</ol>}
  </main>;
}

function GraphPage() {
  const { t } = useTranslation();
  const [kind, setKind] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [pathRequested, setPathRequested] = useState(false);
  const graph = useQuery({ queryKey: ['graph', kind], queryFn: () => api<GraphData>(`/api/graph${kind ? `?types=${encodeURIComponent(kind)}` : ''}`) });
  const path = useQuery({ queryKey: ['graph-path', from, to], queryFn: () => api<{ nodes: { id: string; kind: string; label: string }[]; edges: { relation: string; why: string; evidence: string; evidence_page: number | null }[]; message?: string }>(`/api/graph/path?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`), enabled: pathRequested && Boolean(from && to) });
  const nodes = graph.data?.nodes || [];
  const kinds = [...new Set(nodes.map((node) => node.kind))].sort();
  return <main id="main" className="page-wrap graph-page"><div className="eyebrow">PRISM / {t('knowledgeGraph')}</div><h1>{t('evidenceGraph')}</h1><p className="muted">{t('graphIntro')}</p>
    <div className="graph-tools"><label>{t('filterType')}<select value={kind} onChange={(event) => setKind(event.target.value)}><option value="">{t('allTypes')}</option>{kinds.map((item) => <option key={item} value={item}>{t(item in { record: 1, expedition: 1, station: 1, place: 1, person: 1, institution: 1, series: 1 } ? item : 'record')}</option>)}</select></label><span className="mono">{nodes.length} {t('nodes')} · {graph.data?.edges.length || 0} {t('edges')}</span></div>
    {graph.isError ? <ErrorNotice message={t('offline')} /> : graph.isLoading ? <p>{t('loading')}</p> : <div className="graph-columns"><section><h2>{t('connectedArchiveItems')}</h2><div className="graph-node-list">{nodes.map((node) => <article className="graph-node" key={node.id}><span className={`node-type type-${node.kind}`}>{t(node.kind in { record: 1, expedition: 1, station: 1, place: 1, person: 1, institution: 1, series: 1 } ? node.kind : 'record')}</span><strong>{node.label}</strong><Provenance type={node.provenance} /></article>)}</div></section>
      <aside className="path-panel"><span className="eyebrow">{t('whyConnected')}</span><h2>{t('shortestEvidencePath')}</h2><label>{t('from')}<select value={from} onChange={(event) => { setFrom(event.target.value); setPathRequested(false); }}><option value="">{t('chooseItem')}</option>{nodes.map((node) => <option value={node.id} key={node.id}>{node.label}</option>)}</select></label><label>{t('to')}<select value={to} onChange={(event) => { setTo(event.target.value); setPathRequested(false); }}><option value="">{t('chooseItem')}</option>{nodes.map((node) => <option value={node.id} key={node.id}>{node.label}</option>)}</select></label><button className="button button-pop" disabled={!from || !to} onClick={() => setPathRequested(true)}>{t('findPath')} <ArrowRight size={15} /></button>{path.data && (path.data.message ? <p className="muted">{t('noEvidencePath')}</p> : <ol className="path-steps">{path.data.nodes.map((node, index) => <li key={node.id}><strong>{node.label}</strong>{path.data?.edges[index] && <p>{path.data.edges[index].why}{path.data.edges[index].evidence_page ? ` · ${t('page')} ${path.data.edges[index].evidence_page}` : ''}</p>}</li>)}</ol>)}</aside>
    </div>}
  </main>;
}

function NotFound() {
  const { t } = useTranslation();
  return <main id="main" className="page-wrap empty-route"><span className="eyebrow">PRISM / 404</span><h1>Page not found</h1><Link to="/home" className="button button-pop">{t('home')} <ArrowRight size={16} /></Link></main>;
}

function Footer() {
  const { t } = useTranslation();
  return <footer className="site-footer"><span>PRISM <span className="footer-divider">/</span> {t('brand')}</span><Link to="/stations">{t('stations')}</Link><Link to="/gallery">{t('gallery')}</Link><Link to="/learn">{t('learn')}</Link><Link to="/library">{t('library')}</Link>{!isPublicCatalogue && <><Link to="/graph">{t('knowledgeGraph')}</Link><Link to="/status">{t('status')}</Link></>}<span className="footer-local">{isPublicCatalogue ? t('publicCatalogueLabel') : '127.0.0.1 · LOCAL'}</span></footer>;
}

export default function App() {
  const { theme, textScale, lang } = usePreferences();
  const navigate = useNavigate();
  const profile = useQuery({ queryKey: ['me'], queryFn: () => api<{ user: { email: string } }>('/api/auth/me'), enabled: !isPublicCatalogue, retry: false });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.text = textScale;
    document.documentElement.lang = lang;
    void i18n.changeLanguage(lang);
  }, [theme, textScale, lang]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        navigate(isPublicCatalogue ? '/library' : '/explore?focus=1');
        window.setTimeout(() => document.getElementById('archive-search')?.focus(), 50);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);
  useEffect(() => {
    if (profile.data?.user.email) {
      void api('/api/auth/me/preferences', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ theme, textScale, lang }) }).catch(() => undefined);
    }
  }, [theme, textScale, lang, profile.data?.user.email]);
  return <div className="app-shell"><Header /><Routes>
    <Route path="/" element={<Landing />} /><Route path="/home" element={isPublicCatalogue ? <LibraryPage /> : <Home />} /><Route path="/demo" element={isPublicCatalogue ? <PublicUnavailable /> : <FeatureDemo />} /><Route path="/stations" element={<StationsPage />} /><Route path="/gallery" element={<GalleryPage />} /><Route path="/learn" element={<LearnPage />} /><Route path="/library" element={<LibraryPage />} /><Route path="/login" element={isPublicCatalogue ? <PublicUnavailable /> : <LoginPage />} /><Route path="/explore" element={isPublicCatalogue ? <LibraryPage /> : <Explore />} />
    <Route path="/ask" element={<Ask />} /><Route path="/status" element={isPublicCatalogue ? <PublicUnavailable /> : <StatusPage />} /><Route path="/records/:id" element={isPublicCatalogue ? <PublicUnavailable /> : <Reader />} />
    <Route path="/trace/:recordId/:pageNo" element={isPublicCatalogue ? <PublicUnavailable /> : <TracePage />} /><Route path="/graph" element={isPublicCatalogue ? <PublicUnavailable /> : <GraphPage />} /><Route path="/studio/:libraryId" element={isPublicCatalogue ? <PublicUnavailable /> : <OutreachStudio />} />
    <Route path="*" element={<NotFound />} />
  </Routes><Footer /></div>;
}
