import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import * as Sentry from '@sentry/react';
import { router } from './routes/root';
import { Toaster } from './components/ui/sonner';
import { ErrorFallback } from './components/ErrorFallback';

const queryClient = new QueryClient();

function App() {
  return (
    <Sentry.ErrorBoundary fallback={<ErrorFallback />} showDialog>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />

        <Toaster position='top-right' richColors/>
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  );
}

export default App;