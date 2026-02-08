import styles from "./DayCard.module.css";
import ActivityItem from "./ActivityItem";
import MealItem from "./MealItem";
import TravelSegment from "./TravelSegment";

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function DayCard({ day }) {
  // Merge activities and meals into a timeline sorted by start time
  const timelineItems = [];

  for (const act of day.activities) {
    timelineItems.push({ type: "activity", time: act.planned_start, data: act });
  }
  for (const meal of day.meals) {
    timelineItems.push({ type: "meal", time: meal.planned_time, data: meal });
  }

  timelineItems.sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.dayInfo}>
          <span className={styles.dayNumber}>Day {day.day_number}</span>
          <span className={styles.date}>{formatDate(day.date)}</span>
        </div>
        <div className={styles.budget}>
          <span className={styles.budgetSpent}>
            ${day.daily_budget_spent}
          </span>
          <span className={styles.budgetTotal}>
            / ${day.daily_budget_allocated}
          </span>
        </div>
      </div>

      {day.morning_departure && (
        <TravelSegment segment={day.morning_departure} />
      )}

      <div className={styles.timeline}>
        {timelineItems.map((item, i) => (
          <div key={i}>
            {item.type === "activity" ? (
              <>
                <ActivityItem activity={item.data} />
                {item.data.travel_to_next && (
                  <TravelSegment segment={item.data.travel_to_next} />
                )}
              </>
            ) : (
              <MealItem meal={item.data} />
            )}
          </div>
        ))}
      </div>

      {day.evening_return && (
        <TravelSegment segment={day.evening_return} />
      )}

      <div className={styles.footer}>
        <span className={styles.stat}>
          {day.total_activities} activities
        </span>
        <span className={styles.stat}>
          {day.total_hours > 0 ? `${day.total_hours}h total` : "Full day"}
        </span>
      </div>
    </div>
  );
}
