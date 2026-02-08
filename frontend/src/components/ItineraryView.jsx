import { useTrip } from "../context/TripContext";
import BudgetSummary from "./BudgetSummary";
import BookingLinks from "./BookingLinks";
import DayCard from "./DayCard";
import styles from "./ItineraryView.module.css";

export default function ItineraryView() {
  const { itinerary, preferences, resetToChat, resetAll } = useTrip();

  if (!itinerary) return null;

  const city = preferences?.city || "Kingston";
  const startDate = itinerary.days[0]?.date;
  const endDate = itinerary.days[itinerary.days.length - 1]?.date;

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.tripInfo}>
          <h1 className={styles.title}>Your {city} Itinerary</h1>
          <p className={styles.subtitle}>
            {startDate} to {endDate} &middot; {itinerary.days.length} days &middot;{" "}
            {itinerary.pace} pace &middot; {itinerary.total_activities} activities
          </p>
        </div>
        <div className={styles.actions}>
          <button className={styles.backBtn} onClick={resetToChat}>
            Modify Preferences
          </button>
          <button className={styles.resetBtn} onClick={resetAll}>
            New Trip
          </button>
        </div>
      </div>

      <div className={styles.content}>
        <BudgetSummary
          totalBudget={itinerary.total_budget}
          totalSpent={itinerary.total_spent}
        />

        <BookingLinks links={itinerary.booking_links} />

        <div className={styles.days}>
          {itinerary.days.map((day) => (
            <DayCard key={day.day_number} day={day} />
          ))}
        </div>
      </div>
    </div>
  );
}
