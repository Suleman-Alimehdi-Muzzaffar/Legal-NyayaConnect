import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import * as Sentry from '@sentry/react';
import { Toaster } from 'sonner';
import ErrorBoundary from './components/ErrorBoundary';

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN as string, tracesSampleRate: 0.1 });
}

import App from './App';
import { AuthProvider } from './lib/auth-context';
import { getSavedTheme, getSavedFontScale, applyAppearance, applyTheme, watchSystemTheme } from './lib/appearance';

import './index.css';

function bootUserId(): string | undefined {
  try {
    const raw = localStorage.getItem('nyayaconnect.session');
    if (!raw) return undefined;
    const session: unknown = JSON.parse(raw);
    if (session && typeof session === 'object' && 'user' in session) {
      const user = (session as { user?: { id?: unknown } }).user;
      return typeof user?.id === 'string' ? user.id : undefined;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

const bootUser = bootUserId();
applyAppearance(getSavedTheme(bootUser), getSavedFontScale(bootUser));
watchSystemTheme((theme) => applyTheme(theme, bootUser));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <HelmetProvider>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
        <Toaster theme="dark" richColors position="top-right" />
      </QueryClientProvider>
    </ErrorBoundary>
  </HelmetProvider>,
);
