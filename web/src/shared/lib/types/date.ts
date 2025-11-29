export function prettyDate(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(Math.abs(diffMs) / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return formatTimeAgo(date);
  } else {
    return toDateString(date);
  }
}

export function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
}

export function toTimestamp(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function formatTimeAgo(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(Math.abs(diffMs) / 1000);
  const diffMin = Math.floor(diffSec / 60);

  if (diffMin < 1) {
    return `${diffSec}초 전`;
  } else if (diffMin < 60) {
    return `${diffMin}분 전`;
  } else {
    const hours = Math.floor(diffMin / 60);
    const minutes = diffMin % 60;
    return minutes === 0 ? `${hours}시간 전` : `${hours}시간 ${minutes}분 전`;
  }
}
