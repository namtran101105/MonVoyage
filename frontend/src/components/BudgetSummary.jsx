import styles from "./BudgetSummary.module.css";

export default function BudgetSummary({ totalBudget, totalSpent }) {
  const remaining = totalBudget - totalSpent;
  const pct = Math.min((totalSpent / totalBudget) * 100, 100);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Budget Overview</h3>
      </div>
      <div className={styles.bar}>
        <div
          className={styles.fill}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className={styles.details}>
        <div className={styles.item}>
          <span className={styles.label}>Spent</span>
          <span className={styles.spent}>${totalSpent.toFixed(0)}</span>
        </div>
        <div className={styles.item}>
          <span className={styles.label}>Remaining</span>
          <span className={styles.remaining}>${remaining.toFixed(0)}</span>
        </div>
        <div className={styles.item}>
          <span className={styles.label}>Total Budget</span>
          <span className={styles.total}>${totalBudget.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
}
