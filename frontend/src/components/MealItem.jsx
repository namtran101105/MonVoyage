import styles from "./MealItem.module.css";

const mealEmojis = {
  breakfast: "\u{1F950}",
  lunch: "\u{1F37D}\uFE0F",
  dinner: "\u{1F37E}",
};

export default function MealItem({ meal }) {
  return (
    <div className={styles.item}>
      <div className={styles.timeline}>
        <div className={styles.dot} />
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.badge}>
            {mealEmojis[meal.meal_type] || ""} {meal.meal_type}
          </span>
          <span className={styles.time}>{meal.planned_time}</span>
        </div>
        <h4 className={styles.name}>{meal.venue_name}</h4>
        {meal.notes && <p className={styles.notes}>{meal.notes}</p>}
        <span className={styles.cost}>${meal.estimated_cost.toFixed(2)}</span>
      </div>
    </div>
  );
}
