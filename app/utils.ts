export function getRandomNumberBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function isMobileSizedScreen() {
  try {
    return window.innerWidth < 1100;
  } catch {
    return false;
  }
}
