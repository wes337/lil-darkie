export function isMobileSizedScreen() {
  try {
    return window.innerWidth < 1100;
  } catch {
    return false;
  }
}
