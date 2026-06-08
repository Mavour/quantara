export function nowIso(): string {
  return new Date().toISOString();
}

export function hoursBetween(fromIso: string, to = new Date()): number {
  const from = new Date(fromIso).getTime();
  return (to.getTime() - from) / (1000 * 60 * 60);
}

export function isOlderThanHours(fromIso: string, hours: number): boolean {
  return hoursBetween(fromIso) > hours;
}
