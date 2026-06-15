import { useState, useEffect, useCallback } from "react";
import { SPEECH_CODES } from "./i18n";

export function useReadAloud(langCode = "en") {
  const [speaking, setSpeaking] = useState(false);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      setSpeaking(false);
    };
  }, []);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SPEECH_CODES[langCode] || "en-US";
    utterance.rate = 0.9;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [langCode]);

  return { speaking, speak, stop };
}