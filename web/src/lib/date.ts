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

export function formatTimeAgoWithDate(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(Math.abs(diffMs) / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffMonths / 12);

  if (diffMin < 1) {
    return `${diffSec}초 전`;
  } else if (diffMin < 60) {
    return `${diffMin}분 전`;
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`;
  } else if (diffDays < 30) {
    return `${diffDays}일 전`;
  } else if (diffMonths < 12) {
    const remainingDays = diffDays % 30;
    return remainingDays === 0 ? `${diffMonths}달 전` : `${diffMonths}달 ${remainingDays}일 전`;
  } else {
    const remainingMonths = diffMonths % 12;
    return remainingMonths === 0 ? `${diffYears}년 전` : `${diffYears}년 ${remainingMonths}달 전`;
  }
}

// export function formatTimeAgoEng(date: Date): string {
//   const now = new Date();
//   const diffMs = now.getTime() - date.getTime();
//   const diffSec = Math.floor(Math.abs(diffMs) / 1000);
//   const diffMin = Math.floor(diffSec / 60);
//
//   if (diffMin < 1) {
//     return `${diffSec} second${diffSec !== 1 ? 's' : ''} ago`;
//   } else if (diffMin < 60) {
//     return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
//   } else {
//     const hours = Math.floor(diffMin / 60);
//     const minutes = diffMin % 60;
//
//     if (minutes === 0) {
//       return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
//     } else {
//       const hoursText = `${hours} hour${hours !== 1 ? 's' : ''}`;
//       const minutesText = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
//       return `${hoursText} ${minutesText} ago`;
//     }
//   }
// }
