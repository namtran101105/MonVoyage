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

function weatherEmoji(condition) {
  if (!condition) return "\u{1F324}\uFE0F";
  const c = condition.toLowerCase();
  if (c.includes("thunder")) return "\u26C8\uFE0F";
  if (c.includes("snow") || c.includes("hail")) return "\u2744\uFE0F";
  if (c.includes("rain") || c.includes("drizzle") || c.includes("shower")) return "\u{1F327}\uFE0F";
  if (c.includes("fog") || c.includes("rime")) return "\u{1F32B}\uFE0F";
  if (c.includes("overcast")) return "\u2601\uFE0F";
  if (c.includes("cloudy") || c.includes("partly")) return "\u26C5";
  if (c.includes("clear")) return "\u2600\uFE0F";
  return "\u{1F324}\uFE0F";
}

export default function DayCard({ day, weather }) {
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
        <div className={styles.weather}>
          {weather ? (
            <>
              <span className={styles.weatherCondition}>
                {weatherEmoji(weather.condition)} {weather.condition}
              </span>
              <span className={styles.weatherTemp}>
                {weather.temp_min_c}° / {weather.temp_max_c}°C
              </span>
            </>
          ) : (
            <span className={styles.weatherTemp}>&mdash;</span>
          )}
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
