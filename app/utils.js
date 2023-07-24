export function getRandomNumberBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function isMobileSizedScreen() {
  try {
    return window.innerWidth < 1100;
  } catch {
    return false;
  }
}

export function formateDate(dateString) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    weekday: "short",
  }).format(new Date(dateString));
}

export const CDN_URL = "https://f004.backblazeb2.com/file/lil-darkie";
