export function formatError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Unknown error';
  return ['Quantara Error', '', message].join('\n');
}
