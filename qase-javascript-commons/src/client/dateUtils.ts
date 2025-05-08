// Utils
const pad = (num: number) => num.toString().padStart(2, '0');

export function formatUTCDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function getStartTime(): string {
  const date = new Date();
  return formatUTCDate(new Date(date.getTime() - 10000));
}
