"use client";

import { Volume2, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback, useRef } from "react";

interface SpeakButtonProps {
  text: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function SpeakButton({ text, size = "icon" }: SpeakButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const playSeqRef = useRef<number>(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchWithTimeout = useCallback(async (resource: string, ms: number) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    try {
      const response = await fetch(resource, { signal: controller.signal });
      return response;
    } finally {
      clearTimeout(id);
    }
  }, []);

  const playWithServerTTS = useCallback(async (input: string, seq: number): Promise<"started" | "failed"> => {
    try {
      const res = await fetchWithTimeout(`/api/tts?text=${encodeURIComponent(input)}&lang=vi`, 2500);
      if (!res.ok) return "failed";
      const blob = await res.blob();
      if (blob.size === 0) return "failed";

      // Clean up any existing audio and URL
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch {}
        audioRef.current.src = "";
        audioRef.current = null;
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }

      const objectUrl = URL.createObjectURL(blob);
      objectUrlRef.current = objectUrl;
      const audio = new Audio(objectUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        // Guard against stale handlers
        if (playSeqRef.current !== seq) return;
        setIsSpeaking(true);
      };
      audio.onended = () => {
        if (playSeqRef.current !== seq) return;
        setIsSpeaking(false);
        // Keep URL around briefly to avoid GC mid-playback issues; revoke now that ended
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }
      };
      audio.onerror = () => {
        if (playSeqRef.current !== seq) return;
        setIsSpeaking(false);
      };

      await audio.play();
      // If play() resolves, consider it started; handlers will manage speaking state
      return "started";
    } catch {
      return "failed";
    }
  }, [fetchWithTimeout]);

  const speakWithWebApi = useCallback((input: string): boolean => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return false;
    const synthesis = window.speechSynthesis;
    const voices = synthesis.getVoices();
    const viVoices = voices.filter(v => (v.lang || '').toLowerCase().startsWith('vi'));
    const voice = viVoices[0];

    const utterance = new SpeechSynthesisUtterance(input);
    utterance.lang = "vi-VN";
    utterance.rate = 0.8;
    if (voice) utterance.voice = voice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthesis.cancel();
    synthesis.speak(utterance);
    return true;
  }, []);

  const handleSpeak = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isSpeaking) return;

    // Take ownership for this click to avoid races
    playSeqRef.current += 1;
    const mySeq = playSeqRef.current;

    // Cancel any existing audio/speech immediately and lock UI
    try { window.speechSynthesis?.cancel(); } catch {}
    if (audioRef.current) {
      try { audioRef.current.pause(); } catch {}
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setIsSpeaking(true);

    // Try server TTS with a short timeout; only fall back if we can't start playback
    const result = await playWithServerTTS(text, mySeq);
    if (result === "failed" && playSeqRef.current === mySeq) {
      // If server TTS couldn't start, use Web Speech API
      const started = speakWithWebApi(text);
      if (!started) {
        setIsSpeaking(false);
      }
    }
  }, [isSpeaking, playWithServerTTS, speakWithWebApi, text]);

  if (!isMounted) {
    return <Button variant="ghost" size={size} disabled={true}><LoaderCircle className="animate-spin" /></Button>;
  }

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleSpeak}
      disabled={isSpeaking}
      aria-label={`Listen to ${text}`}
    >
      {isSpeaking ? <LoaderCircle className="animate-spin" /> : <Volume2 />}
    </Button>
  );
}
