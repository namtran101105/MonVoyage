import { useTrip } from "../context/TripContext";
import styles from "./ItineraryTimeline.module.css";

const icons = {
  flight: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
    </svg>
  ),
  food: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
      <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
    </svg>
  ),
  camera: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  hotel: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18"/><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"/>
      <path d="M9 21v-4h6v4"/><rect x="9" y="7" width="2" height="2"/><rect x="13" y="7" width="2" height="2"/>
      <rect x="9" y="11" width="2" height="2"/><rect x="13" y="11" width="2" height="2"/>
    </svg>
  ),
  star: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
};

function getCategoryMeta(category) {
  switch (category) {
    case "museums":
    case "culture":
    case "waterfront":
      return { icon: icons.camera, color: "var(--teal)" };
    case "food":
    case "lunch":
    case "dinner":
    case "breakfast":
      return { icon: icons.food, color: "var(--coral)" };
    case "hotel":
    case "accommodation":
      return { icon: icons.hotel, color: "var(--sky)" };
    case "flight":
    case "transport":
      return { icon: icons.flight, color: "var(--teal)" };
    default:
      return { icon: icons.star, color: "var(--coral)" };
  }
}

const dayTitles = [
  "Arrival & Exploration",
  "Culture & Adventure",
  "The Grand Finale & Farewell",
];

export default function ItineraryTimeline() {
  const { itinerary, preferences } = useTrip();

  if (!itinerary) return null;

  const city = preferences?.city || "Your Destination";
  const days = itinerary.days || [];

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>
        <div>
          <h2 className={styles.title}>Your Itinerary</h2>
          <p className={styles.subtitle}>
            {days.length} days &middot; {city}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className={styles.timeline}>
        {days.map((day) => {
          // Combine activities + meals, sort by time
          const events = [
            ...day.activities.map((a) => ({
              type: "activity",
              time: a.planned_start,
              name: a.venue_name,
              desc: a.notes,
              category: a.category,
              id: a.activity_id,
            })),
            ...(day.meals || []).map((m, i) => ({
              type: "meal",
              time: m.planned_time,
              name: `${m.meal_type.charAt(0).toUpperCase() + m.meal_type.slice(1)} at ${m.venue_name}`,
              desc: m.notes,
              category: "food",
              id: `meal-${day.day_number}-${i}`,
            })),
          ].sort((a, b) => a.time.localeCompare(b.time));

          return (
            <div key={day.day_number} className={styles.dayBlock}>
              {/* Day header */}
              <div className={styles.dayHeader}>
                <span className={styles.dayBadge}>{day.day_number}</span>
                <span className={styles.dayTitle}>
                  {dayTitles[day.day_number - 1] || `Day ${day.day_number}`}
                </span>
              </div>

              {/* Events in this day */}
              <div className={styles.events}>
                {events.map((evt, idx) => {
                  const meta = getCategoryMeta(evt.category);
                  const isLast = idx === events.length - 1;
                  return (
                    <div
                      key={evt.id}
                      className={`${styles.event} ${isLast ? styles.lastEvent : ""}`}
                    >
                      <div className={styles.rail}>
                        <span
                          className={styles.dot}
                          style={{ borderColor: meta.color, color: meta.color }}
                        >
                          {meta.icon}
                        </span>
                        {!isLast && <span className={styles.line} />}
                      </div>
                      <div className={styles.eventBody}>
                        <span className={styles.eventTime}>{evt.time}</span>
                        <span className={styles.eventName}>{evt.name}</span>
                        {evt.desc && (
                          <span className={styles.eventDesc}>
                            {evt.desc.length > 65
                              ? evt.desc.substring(0, 65) + "…"
                              : evt.desc}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <button className={styles.exportBtn}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export Itinerary
        </button>
      </div>
    </div>
  );
}
