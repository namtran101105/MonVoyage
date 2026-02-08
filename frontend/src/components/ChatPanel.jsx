import { useEffect, useRef } from "react";
import { useTrip } from "../context/TripContext";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import styles from "./ChatPanel.module.css";

export default function ChatPanel() {
  const { messages, sendMessage, isExtracting } = useTrip();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isExtracting]);

  return (
    <div className={styles.panel}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoCircle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <div className={styles.logoTextWrap}>
            <span className={styles.logoName}>Virtual Travel Agent</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className={styles.messages}>
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            role={msg.role}
            content={msg.content}
            timestamp={msg.timestamp}
          />
        ))}
        {isExtracting && <ChatMessage role="bot" isLoading />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        disabled={isExtracting}
        placeholder="Follow-up"
      />
    </div>
  );
}
