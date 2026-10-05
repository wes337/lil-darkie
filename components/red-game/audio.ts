export const MUSIC_VOLUME = 0.45;
// The music's level while the found-an-item sound plays over it.
export const MUSIC_DUCKED_VOLUME = 0.12;
export const SOUND_EFFECT_VOLUME = 0.5;

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
