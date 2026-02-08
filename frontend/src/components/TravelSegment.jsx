import styles from "./TravelSegment.module.css";

const modeIcons = {
  walking: "\u{1F6B6}",
  transit: "\u{1F68C}",
  car: "\u{1F697}",
  mixed: "\u{1F6A6}",
};

export default function TravelSegment({ segment }) {
  if (!segment) return null;

  return (
    <div className={styles.segment}>
      <div className={styles.line} />
      <div className={styles.content}>
        <span className={styles.icon}>{modeIcons[segment.mode] || modeIcons.mixed}</span>
        <span className={styles.detail}>
          {segment.from_location} → {segment.to_location}
        </span>
        <span className={styles.meta}>
          {segment.duration_minutes} min
          {segment.mode !== "walking" && segment.cost > 0 && ` · $${segment.cost.toFixed(2)}`}
        </span>
      </div>
      {segment.directions && (
        <p className={styles.directions}>{segment.directions}</p>
      )}
    </div>
  );
}
