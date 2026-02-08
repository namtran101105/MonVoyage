import { useTrip } from "../context/TripContext";
import ValidationBadge from "./ValidationBadge";
import PreferenceCard from "./PreferenceCard";
import styles from "./PreferencesPanel.module.css";

export default function PreferencesPanel() {
  const { preferences, validation, generateItinerary, isGenerating } = useTrip();

  const canGenerate =
    validation &&
    validation.valid &&
    validation.completeness_score >= 1.0;

  if (!preferences) {
    return (
      <div className={styles.panel}>
        <div className={styles.empty}>
          <p className={styles.emptyText}>
            Your trip preferences will appear here as you chat.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>Trip Preferences</h2>
      </div>
      <div className={styles.content}>
        <ValidationBadge validation={validation} />

        <PreferenceCard
          title="Destination"
          items={[
            { label: "City", value: preferences.city },
            { label: "Country", value: preferences.country },
            { label: "Area", value: preferences.location_preference },
          ]}
        />

        <PreferenceCard
          title="Trip Details"
          items={[
            { label: "Start Date", value: preferences.start_date },
            { label: "End Date", value: preferences.end_date },
            {
              label: "Duration",
              value: preferences.duration_days
                ? `${preferences.duration_days} days`
                : null,
            },
          ]}
        />

        <PreferenceCard
          title="Budget"
          items={[
            {
              label: "Total Budget",
              value: preferences.budget
                ? `$${preferences.budget} ${preferences.budget_currency || "CAD"}`
                : null,
            },
            {
              label: "Daily Budget",
              value:
                preferences.budget && preferences.duration_days
                  ? `$${Math.round(preferences.budget / preferences.duration_days)} / day`
                  : null,
            },
          ]}
        />

        <PreferenceCard
          title="Interests & Pace"
          items={[
            {
              label: "Interests",
              value: preferences.interests?.length
                ? preferences.interests.join(", ")
                : null,
            },
            { label: "Pace", value: preferences.pace },
          ]}
        />

        {preferences.booking_type && preferences.booking_type !== "none" && (
          <PreferenceCard
            title="Booking"
            items={[
              { label: "Type", value: preferences.booking_type },
              { label: "Traveling From", value: preferences.source_location },
            ]}
          />
        )}

        {validation?.warnings?.length > 0 && (
          <div className={styles.warnings}>
            {validation.warnings.map((w, i) => (
              <p key={i} className={styles.warningItem}>{w}</p>
            ))}
          </div>
        )}

        {validation?.issues?.length > 0 && (
          <div className={styles.issues}>
            {validation.issues.map((iss, i) => (
              <p key={i} className={styles.issueItem}>{iss}</p>
            ))}
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <button
          className={`${styles.generateBtn} ${canGenerate ? styles.ready : ""}`}
          onClick={generateItinerary}
          disabled={!canGenerate || isGenerating}
        >
          {isGenerating
            ? "Generating..."
            : canGenerate
              ? "Generate Itinerary"
              : "Complete all fields to continue"}
        </button>
      </div>
    </div>
  );
}
