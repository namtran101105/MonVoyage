import { useTrip } from "../context/TripContext";
import ChatInput from "./ChatInput";
import styles from "./WelcomeScreen.module.css";

export default function WelcomeScreen() {
  const { sendMessage, isExtracting, backendConnected } = useTrip();

  return (
    <div className={styles.page}>
      {/* Decorative radials */}
      <div className={styles.glowTR} />
      <div className={styles.glowBL} />

      {/* Center content */}
      <main className={styles.center}>
        {/* Quote icon */}
        <div className={styles.quoteIcon}>
          <svg width="120" height="120" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3">
            <circle cx="50" cy="50" r="40" />
            <path d="M10 50h80" />
            <path d="M50 10a40 40 0 0 1 0 80 40 40 0 0 1 0-80" />
            <ellipse cx="50" cy="50" rx="40" ry="15" />
            <ellipse cx="50" cy="50" rx="15" ry="40" />
          </svg>
        </div>

        <h1 className={styles.quote}>
          Welcome to Letmebook!
        </h1>

        <p className={styles.slogan}>
          Follow you to every corner of the world!
        </p>

        <div className={styles.searchWrap}>
          <ChatInput
            onSend={sendMessage}
            disabled={isExtracting}
            placeholder="Hey buddy, what is your next destination? ✈️"
            variant="landing"
          />
        </div>

        {backendConnected === false && (
          <p className={styles.warning}>
            Backend not connected. Start the server to get started.
          </p>
        )}
      </main>
    </div>
  );
}
