// File: src/lib/logError.ts

export function logError(context: string, error: unknown): void {
  const err = error instanceof Error ? error : new Error(String(error));
  console.error(`[${context}]`, err.message);

  // Optional: send to remote logging service here
  // e.g. logToService({ context, message: err.message, stack: err.stack });
}
