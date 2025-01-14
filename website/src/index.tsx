import 'regenerator-runtime/runtime.js';
import { StrictMode, Suspense } from 'react';
import ReactDOM from 'react-dom';

import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { QueryClient, QueryClientProvider } from 'react-query';
import Layout from './components/Layout';
import Router from './Router';
import FetchError from './services/FetchError';
import ThemeProvider from './components/ThemeProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof FetchError) {
          return error.statusCode >= 500 && failureCount <= 2 ? true : false;
        }

        return false;
      },
      refetchOnWindowFocus: false,
      cacheTime: 0,
    },
  },
});

ReactDOM.render(
  <StrictMode>
    <ThemeProvider>
      {/* @ts-ignore */}
      <SnackbarProvider>
        <QueryClientProvider client={queryClient}>
          <CssBaseline />
          <Layout>
            <Suspense fallback={null}>
              <Router />
            </Suspense>
          </Layout>
        </QueryClientProvider>
      </SnackbarProvider>
    </ThemeProvider>
  </StrictMode>,
  document.getElementById('root')
);
