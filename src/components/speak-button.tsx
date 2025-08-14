"use client";

import { Volume2, LoaderCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SpeakButtonProps {
  text: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function SpeakButton({ text, size = "icon" }: SpeakButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isApiReady, setIsApiReady] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const checkApiReady = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0 && voices.some(v => v.lang === 'vi-VN')) {
        setIsApiReady(true);
        return true;
      }
    }
    return false;
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    if (checkApiReady()) return;

    const handleVoicesChanged = () => checkApiReady();
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    
    // Fallback timer
    const timer = setTimeout(() => {
        checkApiReady();
    }, 500);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      clearTimeout(timer);
    };
  }, [isMounted, checkApiReady]);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!isApiReady || isSpeaking) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "vi-VN";
    utterance.rate = 0.8;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };
  
  if (!isMounted) {
    return <Button variant="ghost" size={size} disabled={true}><LoaderCircle className="animate-spin" /></Button>;
  }

  if (!isApiReady) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size={size} disabled={true}>
              <AlertTriangle />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Text-to-speech is not available on your browser.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
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
