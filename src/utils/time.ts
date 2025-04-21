export function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function getFormattedTimestamp(): string {
  const now: Date = new Date();

  const pad = (num: number): string => num.toString().padStart(2, '0');

  const year: number = now.getFullYear();
  const month: string = pad(now.getMonth() + 1); // 0-based month
  const day: string = pad(now.getDate());
  const hours: string = pad(now.getHours());
  const minutes: string = pad(now.getMinutes());
  const seconds: string = pad(now.getSeconds());

  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}
