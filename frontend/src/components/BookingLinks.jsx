import styles from "./BookingLinks.module.css";

const providerIcons = {
  "Google Flights": "\u2708\uFE0F",
  Skyscanner: "\u2708\uFE0F",
  Airbnb: "\u{1F3E0}",
  TripAdvisor: "\u{1F3AF}",
  Busbud: "\u{1F68C}",
};

export default function BookingLinks({ links }) {
  if (!links) return null;

  const entries = Object.entries(links);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Book Your Trip</h3>
      <div className={styles.grid}>
        {entries.map(([key, link]) => (
          <a
            key={key}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.card}
          >
            <span className={styles.icon}>
              {providerIcons[link.provider] || "\u{1F517}"}
            </span>
            <div className={styles.info}>
              <span className={styles.label}>{link.label}</span>
              <span className={styles.provider}>{link.provider}</span>
            </div>
            <svg
              className={styles.arrow}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}
