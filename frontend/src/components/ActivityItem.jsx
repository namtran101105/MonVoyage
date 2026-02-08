import styles from "./ActivityItem.module.css";

const categoryColors = {
  food: "var(--tag-food)",
  museums: "var(--tag-museums)",
  waterfront: "var(--tag-waterfront)",
  "Culture and History": "var(--tag-culture)",
  Entertainment: "var(--tag-entertainment)",
  Sport: "var(--tag-sport)",
  "Natural Place": "var(--tag-nature)",
  other: "var(--tag-other)",
};

function venueUrl(name) {
  const q = new URLSearchParams({ api: "1", query: name });
  return `https://www.google.com/maps/search/?${q}`;
}

export default function ActivityItem({ activity }) {
  const tagColor = categoryColors[activity.category] || "var(--tag-other)";

  return (
    <div className={styles.item}>
      <div className={styles.timeline}>
        <div className={styles.dot} style={{ borderColor: tagColor }} />
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.time}>
            {activity.planned_start} - {activity.planned_end}
          </span>
          {activity.category && (
            <span
              className={styles.tag}
              style={{ background: tagColor + "1a", color: tagColor }}
            >
              {activity.category}
            </span>
          )}
        </div>
        <h4 className={styles.name}>
          <a
            href={venueUrl(activity.venue_name)}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.nameLink}
          >
            {activity.venue_name}
          </a>
        </h4>
        {activity.notes && <p className={styles.notes}>{activity.notes}</p>}
        <div className={styles.footer}>
          {activity.estimated_cost > 0 && (
            <span className={styles.cost}>
              ${activity.estimated_cost.toFixed(2)}
            </span>
          )}
          {activity.estimated_cost === 0 && (
            <span className={styles.free}>Free</span>
          )}
          {activity.duration_reason && (
            <span className={styles.reason} title={activity.duration_reason}>
              {activity.duration_reason}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
