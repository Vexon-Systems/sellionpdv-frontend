import * as Sentry from '@sentry/react';
import type { ErrorComponentProps } from '@tanstack/react-router';
import { ErrorFallback } from '@/components/ErrorFallback';

export function RootErrorComponent({ error }: ErrorComponentProps) {
    Sentry.captureException(error);
    return <ErrorFallback error={error} />;
}
