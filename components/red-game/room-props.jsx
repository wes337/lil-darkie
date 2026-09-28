import assets from "./prop-assets.json";
import { artSources } from "./art";
import { randomizeHoverTilt } from "./hover-motion";
import styles from "@/styles/room-props.module.scss";

// Normalize the transparent padding in CSS, preserving the original art and its alpha.
// Bounds are full-res pixels applied as percentages, so they fit the mobile copy too.
export function Prop({
  asset,
  className = "",
  onClick,
  disabled = false,
  label,
}) {
  const image = assets[asset];
  const [left, top, right, bottom] = image.bounds;
  const width = right - left + 1;
  const height = bottom - top + 1;
  const Tag = onClick ? "button" : "span";

  return (
    <Tag
      className={`${styles.sprite} ${className}`}
      data-asset={asset}
      style={{
        aspectRatio: `${width} / ${height}`,
        "--prop-ratio": width / height,
      }}
      {...(onClick
        ? {
            type: "button",
            onClick,
            onPointerEnter: randomizeHoverTilt,
            disabled,
            "aria-label": label || `Inspect ${image.label}`,
          }
        : { "aria-hidden": true })}
    >
      <img
        {...artSources(image.src)}
        alt=""
        width={image.width}
        height={image.height}
        draggable={false}
        style={{
          width: `${(image.width / width) * 100}%`,
          height: `${(image.height / height) * 100}%`,
          left: `${(-left / width) * 100}%`,
          top: `${(-top / height) * 100}%`,
        }}
      />
    </Tag>
  );
}

export function Desk({ onInspect, disabled = false, progress }) {
  const inspect = (asset) => (onInspect ? () => onInspect(asset) : undefined);
  return (
    <div className={styles.deskSet}>
      <Prop asset="desk" className={styles.desk} />
      <Prop
        asset="computer-monitor"
        className={styles.monitor}
        onClick={inspect("computer-monitor")}
        disabled={disabled}
        label="Inspect computer screen"
      />
      <Prop
        asset="computer-tower"
        className={styles.tower}
        onClick={inspect("computer-tower")}
        disabled={disabled}
      />
      <Prop
        asset="desk-lamp-on"
        className={styles.deskLamp}
        onClick={inspect("desk-lamp-on")}
        disabled={disabled}
        label="Inspect desk lamp"
      />
      <Prop
        asset="keyboard"
        className={styles.keyboard}
        onClick={inspect("keyboard")}
        disabled={disabled}
      />
      <Prop
        asset="desk-note"
        className={styles.note}
        onClick={inspect("desk-note")}
        disabled={disabled}
        label="Read the note"
      />
      {!["threaded", "used"].includes(progress?.sewing) && (
        <Prop
          asset="thread-spool"
          className={styles.thread}
          onClick={inspect("thread-spool")}
          disabled={disabled}
          label="Inspect sewing thread"
        />
      )}
    </div>
  );
}

export function Safe({ onInspect, disabled = false }) {
  return (
    <div className={styles.safeSet}>
      <Prop asset="safe-door" />
      <Prop
        asset="safe-handle"
        className={styles.safeHandle}
        onClick={() => onInspect("safe-handle")}
        disabled={disabled}
        label="Turn safe handle"
      />
      <Prop
        asset="safe-keypad"
        className={styles.safeKeypad}
        onClick={() => onInspect("safe-keypad")}
        disabled={disabled}
        label="Inspect the keypad"
      />
    </div>
  );
}

export function SafeInterior({ onInspect, progress }) {
  return (
    <div className={styles.safeSet}>
      <Prop asset="safe-interior-empty" />
      {!progress.keyTaken && (
        <Prop
          asset="key"
          className={styles.safeKey}
          onClick={() => onInspect("key")}
          label="Pick up the key"
        />
      )}
      {!progress.cdTaken && (
        <Prop
          asset="cd"
          className={styles.safeDisc}
          onClick={() => onInspect("cd")}
          label="Pick up the CD"
        />
      )}
    </div>
  );
}

export function Plant({ onInspect, disabled = false, progress }) {
  return (
    <div className={styles.plantSet}>
      <Prop
        asset={progress.water === "spent" ? "flower-blooming" : "flower-wilted"}
        className={styles.plantFlower}
        onClick={() => onInspect("flower-wilted")}
        disabled={disabled}
        label="Inspect the flower"
      />
      <Prop
        asset="stool"
        className={styles.plantStool}
        onClick={() => onInspect("stool")}
        disabled={disabled}
      />
    </div>
  );
}

export default function RoomProps({ room, interactive, onInspect, progress }) {
  const inspect = (asset) => () => onInspect(asset);
  return (
    <div className={styles.props} data-room={room.id}>
      {room.id === "main" && (
        <button
          className={styles.doorHotspot}
          onClick={inspect("door-front")}
          disabled={!interactive}
          aria-label="Inspect doorway"
        />
      )}
      {room.id === "computer" && (
        <>
          <div
            className={styles.deskPlacement}
            onPointerEnter={interactive ? randomizeHoverTilt : undefined}
          >
            <Desk progress={progress} />
            <button
              className={styles.deskHotspot}
              onClick={inspect("desk")}
              disabled={!interactive}
              aria-label="Inspect computer desk"
            />
          </div>
          <Prop
            asset={progress.lampOn ? "floor-lamp-on" : "floor-lamp-off"}
            className={styles.floorLampPlacement}
            onClick={inspect("floor-lamp-off")}
            disabled={!interactive}
            label="Toggle standing lamp"
          />
        </>
      )}
      {room.id === "safe" && (
        <>
          <div className={styles.safePlacement}>
            <Safe onInspect={onInspect} disabled={!interactive} />
          </div>
          <div className={styles.plantPlacement}>
            <Plant
              onInspect={onInspect}
              disabled={!interactive}
              progress={progress}
            />
          </div>
          <Prop asset="footprints" className={styles.footprintsPlacement} />
          <Prop
            asset="mouse-hole"
            className={styles.holePlacement}
            onClick={inspect("mouse-hole")}
            disabled={!interactive}
            label="Look into the mouse hole"
          />
        </>
      )}
      {room.id === "sink" && (
        <>
          <Prop
            asset="wall-light"
            className={styles.wallLightPlacement}
            onClick={inspect("wall-light")}
            disabled={!interactive}
          />
          <Prop
            asset="cracked-mirror"
            className={styles.mirrorPlacement}
            onClick={inspect("cracked-mirror")}
            disabled={!interactive}
          />
          <Prop
            asset="sink"
            className={styles.sinkPlacement}
            onClick={inspect("sink")}
            disabled={!interactive}
          />
          {progress.bear !== "collected" && (
            <Prop
              asset="bear-ripped"
              className={styles.bearPlacement}
              onClick={inspect("bear-ripped")}
              disabled={!interactive}
              label="Inspect the ripped bear"
            />
          )}
        </>
      )}
    </div>
  );
}
