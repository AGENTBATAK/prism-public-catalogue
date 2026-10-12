import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, HashRouter } from 'react-router';
import { isPublicCatalogue } from './public-catalogue';
import { applyPublicLabels } from './public-labels';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/dm-mono/400.css';
import '@fontsource/dm-mono/500.css';
import '@fontsource/noto-sans-devanagari/400.css';
import '@fontsource/noto-sans-devanagari/600.css';
import './i18n';
import './style.css';
import App from './ui/App';

if (isPublicCatalogue) { applyPublicLabels(); document.documentElement.dataset.publicCatalogue = 'true'; }
const Router = isPublicCatalogue ? HashRouter : BrowserRouter;

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 15_000 } } });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router><App /></Router>
    </QueryClientProvider>
  </React.StrictMode>,
);
