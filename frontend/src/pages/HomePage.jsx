import { useTrip } from "../context/TripContext";
import WelcomeScreen from "../components/WelcomeScreen";
import ChatPanel from "../components/ChatPanel";
import PreferencesPanel from "../components/PreferencesPanel";
import ItineraryView from "../components/ItineraryView";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const { phase, isGenerating } = useTrip();

  if (phase === "welcome") {
    return <WelcomeScreen />;
  }

  // Full-page itinerary view
  if (phase === "itinerary") {
    return <ItineraryView />;
  }

  // Phase: "chat" — two-panel layout with preferences on right
  return (
    <div className={styles.layout}>
      <div className={styles.chatSide}>
        <ChatPanel />
      </div>
      <div className={styles.rightSide}>
        <PreferencesPanel />
      </div>

      {isGenerating && (
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <div className={styles.spinner} />
            <p className={styles.overlayText}>Crafting your perfect itinerary…</p>
          </div>
        </div>
      )}
    </div>
  );
}
