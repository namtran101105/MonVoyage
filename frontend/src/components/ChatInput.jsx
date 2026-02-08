import { useState, useRef, useEffect } from "react";
import styles from "./ChatInput.module.css";

export default function ChatInput({ onSend, disabled, placeholder, variant }) {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  // Auto-focus input on mount and whenever it becomes enabled again
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  // Re-focus when clicking anywhere in the wrapper
  const handleWrapperClick = () => {
    inputRef.current?.focus();
  };

  const handleSubmit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
    // Auto-focus back to input after sending
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isLanding = variant === "landing";

  return (
    <div className={`${styles.wrapper} ${isLanding ? styles.landing : ""}`} onClick={handleWrapperClick}>
      <div className={styles.inputContainer}>
        {/* Paperclip / attach */}
        <button className={styles.iconBtn} aria-label="Attach file" type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        <input
          ref={inputRef}
          type="text"
          className={styles.input}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Tell me some places you got in mind? ✈️"}
          disabled={disabled}
          autoComplete="off"
          autoFocus
        />

        {/* Mic */}
        <button className={styles.iconBtn} aria-label="Voice input" type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </button>

        {/* Send */}
        <button
          className={styles.sendBtn}
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
