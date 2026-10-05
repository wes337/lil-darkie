import { useEffect, useRef } from "react";
import styles from "@/styles/game-ui.module.scss";

// Asks before the EXIT button throws the game away, in the game's text box
// look but filling the screen. Escape answers no.
export default function ExitDialog({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    // The <dialog> is always rendered, so its ref is set before effects run.
    const element = ref.current!;
    element.showModal();
    return () => element.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={`${styles.dialog} ${styles.exitDialog}`}
      aria-label="Exit the game"
      onCancel={(event) => {
        event.preventDefault();
        onNo();
      }}
    >
      <div className={styles.dialogBody}>
        <p>are you sure you want to exit?</p>
        <div className={styles.choices}>
          <button className={styles.textButton} onClick={onYes}>
            Yes
          </button>
          <button className={styles.textButton} onClick={onNo}>
            No
          </button>
        </div>
      </div>
    </dialog>
  );
}
