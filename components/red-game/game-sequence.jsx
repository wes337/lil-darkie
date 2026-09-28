import { useEffect, useRef, useState } from 'react';
import { Prop } from './room-props';
import styles from '@/styles/game-sequence.module.scss';

const CAN_SKIP_ANIMATION = process.env.NODE_ENV === 'development';
const ENDING_SOUNDS = {
  4: 'Starrynight_C_1 (99Sounds).mp3',
  5: 'Starrynight_C_5 (99Sounds).mp3',
  6: 'Starrynight_G_5 (99Sounds).mp3',
};

export default function GameSequence({ type, onFinish, onSound }) {
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const root = useRef(null);
  const returnButton = useRef(null);
  const endingSounds = useRef({});
  const finish = useRef(onFinish);
  finish.current = onFinish;
  useEffect(() => {
    let cancelled = false;
    root.current.focus();
    Promise.allSettled([...root.current.querySelectorAll('img')].map((img) => img.decode())).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    if (!ready) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const times = type === 'repair' ? [900, 1400, 3200] : [1700, 3200, 5500, 7600, 11300, 15000];
    const timers = times.map((time, index) => window.setTimeout(() => {
      if (type === 'repair' && index === times.length - 1) finish.current();
      else setStep((current) => current >= 6 ? current : index + 1);
    }, reduced ? Math.min(time, (index + 1) * (type === 'repair' ? 450 : 1900)) : time));
    return () => timers.forEach(window.clearTimeout);
  }, [type, ready]);
  useEffect(() => { if (step === 6) returnButton.current?.focus(); }, [step]);
  useEffect(() => {
    if (type !== 'ending') return;
    const sound = endingSounds.current[step];
    if (!sound) return;
    sound.currentTime = 0;
    sound.play().catch(() => {});
    return () => { sound.pause(); };
  }, [type, step]);
  useEffect(() => {
    if (type === 'repair' && step === 2) onSound('bear-repaired');
    if (type === 'ending' && step === 1) onSound('door-open');
  }, [type, step, onSound]);
  return <section ref={root} className={styles.sequence} data-type={type} data-step={step} data-ready={ready}
    tabIndex={-1} aria-label={type === 'repair' ? 'Mending Bambi' : 'Leaving the room'}
    onKeyDown={CAN_SKIP_ANIMATION ? (event) => { if (event.key === 'Escape' && type === 'ending') { event.stopPropagation(); setStep(6); } } : undefined}>
    {type === 'repair' ? <>
      <img className={styles.repairWall} src="/images/red-game/sink-left-wall/room.png" alt="" draggable={false} />
      <div className={styles.bear} hidden={step >= 2}><Prop asset="bear-ripped" large /></div>
      <div className={styles.bear} hidden={step < 2}><Prop asset="bear-repaired" large /></div>
      <div className={styles.repairFade} />
    </> : <>
      {Object.entries(ENDING_SOUNDS).map(([soundStep, filename]) => <audio
        key={soundStep}
        ref={(element) => { endingSounds.current[soundStep] = element; }}
        src={`/red-game/sounds/${filename}`} preload="auto" hidden
      />)}
      <img className={styles.field} src="/images/red-game/outdoors/field.png" alt={step >= 6 ? 'The field and sky turn red.' : 'A bright field opens out beneath a blue sky.'} draggable={false} />
      <div className={styles.doorStage}>
        <div className={styles.door}>
          <Prop asset="door-front" large />
          <div className={styles.key}><Prop asset="key" /></div>
        </div>
      </div>
      <div className={styles.shade} />
      <p className={styles.endingText} aria-live="polite" key={step}>{step === 4 ? 'YOU ARE FREE' : step === 5 ? 'YOU ALWAYS HAVE BEEN' : step >= 6 ? 'RED' : ''}</p>
      {step < 6 && CAN_SKIP_ANIMATION && <button className={styles.skip} onClick={() => setStep(6)}>Skip animation</button>}
      {step >= 6 && <button ref={returnButton} className={styles.return} onClick={onFinish}>END</button>}
    </>}
  </section>;
}
