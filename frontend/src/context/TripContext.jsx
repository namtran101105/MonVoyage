import { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  checkHealth,
  extractPreferences,
  refinePreferences,
  generateItinerary as apiGenerateItinerary,
  fetchWeather,
} from "../api/tripApi";

const TripContext = createContext(null);

export function TripProvider({ children }) {
  const [phase, setPhase] = useState("welcome");
  const [messages, setMessages] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [validation, setValidation] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [weather, setWeather] = useState(null);
  const [backendConnected, setBackendConnected] = useState(null);

  useEffect(() => {
    checkHealth()
      .then((data) => {
        setBackendConnected(data.nlp_service_ready);
      })
      .catch(() => {
        setBackendConnected(false);
      });
  }, []);

  const addMessage = useCallback((role, content) => {
    const msg = { id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, role, content, timestamp: Date.now() };
    setMessages((prev) => [...prev, msg]);
    return msg.id;
  }, []);

  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim()) return;

      if (phase === "welcome") {
        setPhase("chat");
      }

      addMessage("user", text);
      setIsExtracting(true);

      try {
        const data = preferences
          ? await refinePreferences(preferences, text)
          : await extractPreferences(text);

        if (data.success) {
          setPreferences(data.preferences);
          setValidation(data.validation);

          const botMsg =
            data.bot_message || "I've extracted your preferences. Check the panel on the right for details.";
          addMessage("bot", botMsg);

          if (data.saved_to_file) {
            addMessage("system", `Trip preferences saved to: ${data.saved_to_file}`);
          }
        } else {
          addMessage("bot", data.error || "Something went wrong. Please try again.");
        }
      } catch (err) {
        addMessage("bot", `Failed to process: ${err.message}`);
      } finally {
        setIsExtracting(false);
      }
    },
    [phase, preferences, addMessage]
  );

  const doGenerateItinerary = useCallback(async () => {
    setIsGenerating(true);
    try {
      const data = await apiGenerateItinerary();
      if (data.success) {
        setItinerary(data.itinerary);
        setPhase("itinerary");

        // Extract fallback weather from itinerary days (mock data)
        const days = data.itinerary.days;
        const fallback = {};
        for (const d of days) {
          if (d.weather) fallback[d.date] = d.weather;
        }

        // Try fetching live weather from the API
        if (days.length > 0) {
          const city = preferences?.city || "Kingston";
          const country = preferences?.country || "Canada";
          const startDate = days[0].date;
          const endDate = days[days.length - 1].date;
          fetchWeather(city, country, startDate, endDate)
            .then((res) => {
              if (res.success && res.forecasts && res.forecasts.length > 0) {
                const byDate = {};
                for (const f of res.forecasts) {
                  byDate[f.date] = f;
                }
                setWeather(byDate);
              } else {
                // API returned no forecasts (dates too far out); use fallback
                setWeather(fallback);
              }
            })
            .catch(() => {
              // Backend unreachable; use fallback weather from itinerary
              setWeather(fallback);
            });
        } else if (Object.keys(fallback).length > 0) {
          setWeather(fallback);
        }
      }
    } catch (err) {
      addMessage("bot", `Failed to generate itinerary: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  }, [addMessage, preferences]);

  const resetToChat = useCallback(() => {
    setPhase("chat");
  }, []);

  const resetAll = useCallback(() => {
    setPhase("welcome");
    setMessages([]);
    setPreferences(null);
    setValidation(null);
    setItinerary(null);
    setWeather(null);
    setIsExtracting(false);
    setIsGenerating(false);
  }, []);

  return (
    <TripContext.Provider
      value={{
        phase,
        messages,
        preferences,
        validation,
        isExtracting,
        isGenerating,
        itinerary,
        weather,
        backendConnected,
        sendMessage,
        generateItinerary: doGenerateItinerary,
        resetToChat,
        resetAll,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error("useTrip must be used within TripProvider");
  return ctx;
}
