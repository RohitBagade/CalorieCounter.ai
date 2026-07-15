import { useEffect, useRef, useState, useCallback } from "react";

// Voice input via the browser-native Web Speech API — no deps, no backend, no cost.
// Feature-detected: `supported` is false where the API is missing (e.g. Firefox),
// so the caller can hide the mic and fall back to typing.
export function useSpeechInput(onTranscript) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    setSupported(true);

    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = true; // live transcription while speaking
    rec.continuous = false;
    rec.onresult = (e) => {
      const text = Array.from(e.results).map((r) => r[0].transcript).join("");
      onTranscript(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;

    return () => {
      try { rec.abort(); } catch { /* ignore */ }
    };
  }, [onTranscript]);

  const toggle = useCallback(() => {
    const rec = recRef.current;
    if (!rec) return;
    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      try {
        rec.start();
        setListening(true);
      } catch { /* already started */ }
    }
  }, [listening]);

  return { listening, supported, toggle };
}
