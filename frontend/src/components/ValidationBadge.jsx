import styles from "./ValidationBadge.module.css";

export default function ValidationBadge({ validation }) {
  if (!validation) return null;

  const pct = Math.round(validation.completeness_score * 100);
  const isValid = validation.valid;

  return (
    <div className={styles.container}>
      <div className={styles.ring}>
        <svg viewBox="0 0 36 36" className={styles.svg}>
          <path
            className={styles.bgCircle}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className={styles.fgCircle}
            strokeDasharray={`${pct}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            style={{
              stroke: pct >= 100 && isValid ? "var(--color-success)" : "var(--accent-primary)",
            }}
          />
        </svg>
        <span className={styles.pctText}>{pct}%</span>
      </div>
      <div className={styles.info}>
        <span className={styles.label}>Completeness</span>
        <span
          className={`${styles.badge} ${isValid ? styles.valid : styles.warning}`}
        >
          {isValid ? "Valid" : "Incomplete"}
        </span>
      </div>
    </div>
  );
}
