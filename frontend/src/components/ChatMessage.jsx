import styles from "./ChatMessage.module.css";
import LoadingSpinner from "./LoadingSpinner";

export default function ChatMessage({ role, content, timestamp, isLoading }) {
  const timeStr = timestamp
    ? new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className={`${styles.message} ${styles[role]}`}>
      {role === "bot" && (
        <div className={styles.avatar}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </div>
      )}
      <div className={styles.bubbleWrap}>
        <div className={styles.bubble}>
          {isLoading ? <LoadingSpinner /> : content}
        </div>
        {timeStr && <span className={styles.time}>{timeStr}</span>}
      </div>
    </div>
  );
}
