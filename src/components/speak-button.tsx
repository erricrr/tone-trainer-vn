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
      // Add multiple cache-busting parameters to ensure unique URLs for different texts
      // Use a simple hash based on text length and character codes (Unicode-safe)
      const textHash = input.split('').reduce((hash, char) => {
        return ((hash << 5) - hash + char.charCodeAt(0)) & 0xfffff;
      }, 0).toString(16);

      // Add timestamp to make each request completely unique (no caching issues)
      const timestamp = Date.now();
      const res = await fetchWithTimeout(`/api/tts?text=${encodeURIComponent(input)}&lang=vi&h=${textHash}&t=${timestamp}`, 3000);
      if (!res.ok) {
        console.log(`TTS API failed with status ${res.status} for text: "${input}"`);
        return "failed";
      }
      const blob = await res.blob();
      if (blob.size === 0) {
        console.log(`TTS API returned empty blob for text: "${input}"`);
        return "failed";
      }

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

      // Set up event handlers before preloading
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

      // Preload the audio to reduce play delay
      audio.preload = 'auto';

      // Try to play immediately - this will trigger faster
      await audio.play();
      // If play() resolves, consider it started; handlers will manage speaking state
      return "started";
    } catch (error) {
      console.log(`TTS playback failed for text: "${input}"`, error);
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

    // Show loading state immediately for better UX
    setIsSpeaking(true);

    // Try server TTS (Google TTS)
    const result = await playWithServerTTS(text, mySeq);
    if (result === "failed" && playSeqRef.current === mySeq) {
      // Google TTS failed - just stop, don't fall back to web speech
      console.log(`Google TTS failed for text: "${text}" - not falling back to web speech`);
      setIsSpeaking(false);
    }
  }, [isSpeaking, playWithServerTTS, text]);

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
