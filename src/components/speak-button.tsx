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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const playWithServerTTS = useCallback(async (input: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/tts?text=${encodeURIComponent(input)}&lang=vi`);
      if (!res.ok) return false;
      const blob = await res.blob();
      if (blob.size === 0) return false;

      // Stop any existing playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }

      const objectUrl = URL.createObjectURL(blob);
      const audio = new Audio(objectUrl);
      audioRef.current = audio;

      return await new Promise<boolean>((resolve) => {
        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(objectUrl);
          resolve(true);
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(objectUrl);
          resolve(false);
        };
        // Start playback
        audio.play().catch(() => {
          setIsSpeaking(false);
          URL.revokeObjectURL(objectUrl);
          resolve(false);
        });
      });
    } catch {
      return false;
    }
  }, []);

  const speakWithWebApi = useCallback((input: string): boolean => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return false;
    const synthesis = window.speechSynthesis;
    const voices = synthesis.getVoices();
    const viVoices = voices.filter(v => (v.lang || '').toLowerCase().startsWith('vi'));
    const preferred = viVoices.find(v => /google|viet|viêt|vietnam/i.test(v.name));
    const voice = preferred || viVoices[0];

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

    // Try high-quality server TTS first, then fall back to Web Speech API
    const ok = await playWithServerTTS(text);
    if (!ok) {
      speakWithWebApi(text);
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
