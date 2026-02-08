import styles from "./TravelSegment.module.css";

const modeIcons = {
  walking: "\u{1F6B6}",
  transit: "\u{1F68C}",
  car: "\u{1F697}",
  ferry: "\u26F4\uFE0F",
  mixed: "\u{1F6A6}",
};

const gmapsModes = {
  walking: "walking",
  transit: "transit",
  car: "driving",
  ferry: "transit",
  mixed: "transit",
};

function mapsUrl(from, to, mode) {
  const params = new URLSearchParams({
    api: "1",
    origin: from,
    destination: to,
    travelmode: gmapsModes[mode] || "transit",
  });
  return `https://www.google.com/maps/dir/?${params}`;
}

export default function TravelSegment({ segment }) {
  if (!segment) return null;

  const url = mapsUrl(segment.from_location, segment.to_location, segment.mode);

  return (
    <div className={styles.segment}>
      <div className={styles.line} />
      <a href={url} target="_blank" rel="noopener noreferrer" className={styles.link}>
        <div className={styles.content}>
          <span className={styles.icon}>{modeIcons[segment.mode] || modeIcons.mixed}</span>
          <span className={styles.detail}>
            {segment.from_location} &rarr; {segment.to_location}
          </span>
          <span className={styles.meta}>
            {segment.duration_minutes} min
            {segment.mode !== "walking" && segment.cost > 0 && ` · $${segment.cost.toFixed(2)}`}
          </span>
        </div>
        {segment.directions && (
          <p className={styles.directions}>{segment.directions}</p>
        )}
      </a>
    </div>
  );
}
