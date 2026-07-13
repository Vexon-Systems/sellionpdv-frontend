import * as Sentry from "@sentry/react";

/**
 * Records operational failures without serializing HTTP responses, headers,
 * request bodies, or credentials into production logs/telemetry.
 */
export function reportOperationalError(context: string, error: unknown) {
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, error);
    return;
  }

  Sentry.withScope((scope) => {
    scope.setTag("context", context);
    Sentry.captureMessage("Operational request failed", "error");
  });
}
