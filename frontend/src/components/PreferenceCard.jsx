import styles from "./PreferenceCard.module.css";

export default function PreferenceCard({ title, items }) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.items}>
        {items.map((item, i) => (
          <div key={i} className={styles.row}>
            <span className={styles.label}>{item.label}</span>
            <span className={item.value ? styles.value : styles.empty}>
              {item.value || "Not specified"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
