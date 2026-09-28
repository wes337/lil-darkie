import { useEffect, useRef, useState } from 'react';
import { TOPICS } from './game-content.mjs';
import { Prop } from './room-props';
import styles from '@/styles/game-ui.module.scss';

export default function GameDialog({ game, onClose, onTalk, onSound }) {
  const ref = useRef(null);
  const answerRef = useRef(null);
  const [page, setPage] = useState(0);
  const [activeTopic, setActiveTopic] = useState(null);
  // Picked once per open so the backdrop art doesn't wobble between pages.
  const [artTilt] = useState(() => Math.random() * 6 - 3);
  const { dialog } = game;
  useEffect(() => {
    const element = ref.current;
    const origin = document.activeElement;
    element.showModal();
    return () => {
      element.close();
      if (origin?.isConnected && !origin.closest('[inert]')) origin.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => { setPage(0); }, [dialog]);
  useEffect(() => {
    if (activeTopic) answerRef.current?.focus({ preventScroll: true });
  }, [activeTopic]);
  const messages = dialog.messages || [];
  const lastPage = page >= messages.length - 1;
  // Chosen by the store (see `dialogArt` in use-game.js).
  const art = dialog.art && page >= dialog.art.fromPage ? dialog.art.asset : null;
  return (
    <dialog ref={ref} className={styles.dialog} aria-label={dialog.kind === 'conversation' ? 'A voice in the hole' : 'Red Game message'}
      onCancel={(event) => { event.preventDefault(); event.stopPropagation(); onClose(); }}
      onKeyDown={(event) => { if (event.key === 'Escape') event.stopPropagation(); }}>
      {art && <div className={styles.dialogArt} style={{ rotate: `${artTilt}deg` }}><Prop asset={art} large /></div>}
      <button className={styles.close} aria-label="Close text box" onClick={onClose}>
        <img src="/images/red-game/navigation/close-x.png" alt="" width={1254} height={1254} draggable={false} />
      </button>
      <div className={styles.dialogBody}>
        {messages.length > 0 && <p ref={answerRef} tabIndex={-1} aria-live="polite">{messages[Math.min(page, messages.length - 1)]}</p>}
        {!lastPage && <button className={styles.textButton} onClick={() => { onSound(dialog.pageSounds?.[page + 1] || 'text'); setPage(page + 1); }}>Continue</button>}
        {dialog.kind === 'conversation' && <div className={styles.choices}>
          {Object.entries(TOPICS).filter(([id]) => id !== activeTopic).map(([id, topic]) => <button key={id} className={styles.textButton} data-topic={id} data-visited={game.progress.topics.includes(id)} onClick={() => { setActiveTopic(id); onTalk(id); }}>{topic.label}</button>)}
          {game.progress.topics.length === 3 && <button className={styles.textButton} onClick={() => { setActiveTopic('help'); onTalk('help'); }}>Can you help me?</button>}
        </div>}
      </div>
    </dialog>
  );
}
