export const MUSIC_VOLUME = 0.45;
export const SOUND_EFFECT_VOLUME = 0.15;

export function playSound(
  sound: HTMLAudioElement | null | undefined,
  volume = SOUND_EFFECT_VOLUME,
) {
  if (!sound) return;
  sound.volume = volume;
  sound.currentTime = 0;
  // A blocked or failed sound should never interrupt gameplay.
  sound.play().catch(() => {});
}
