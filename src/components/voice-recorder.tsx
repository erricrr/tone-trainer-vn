"use client";

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Mobile detection utility
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         ('ontouchstart' in window) ||
         (navigator.maxTouchPoints > 0);
};

type RecordingStatus = 'idle' | 'permission_denied' | 'recording' | 'recorded';

const MAX_RECORDING_SECONDS = 3;

export function VoiceRecorder() {
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [countdown, setCountdown] = useState(MAX_RECORDING_SECONDS);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Clean up timers and URL object when component unmounts
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl]);



  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleError = (e: Event) => {
      console.error('Audio playback error:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);


  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      return stream;
    } catch (err) {
      console.error("Microphone access denied:", err);
      setRecordingStatus('permission_denied');
      toast({
        title: "Microphone Access Denied",
        description: "Please enable microphone permissions in your browser settings to use this feature.",
        variant: "destructive",
      });
      return null;
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  const startRecording = async () => {
    const stream = await requestMicPermission();
    if (!stream) return;

    const mobile = isMobile();
    console.log('Starting recording on mobile device:', mobile);

    setRecordingStatus('recording');
    setCountdown(MAX_RECORDING_SECONDS);
    audioChunksRef.current = [];

    // Use mobile-friendly audio settings
    let options = {};
    if (mobile) {
      // Try mobile-optimized format first
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options = { mimeType: 'audio/webm;codecs=opus' };
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
      }
    } else {
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      }
    }

    const mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      // Determine the correct MIME type based on what was actually used
      const mimeType = mediaRecorder.mimeType || 'audio/webm';
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);
      setRecordingStatus('recorded');

      console.log('Recording completed with MIME type:', mimeType);

      // Stop all tracks on the stream to turn off the mic indicator
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.start();

    countdownIntervalRef.current = window.setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1));
    }, 1000);

    timerRef.current = setTimeout(() => {
        stopRecording();
    }, MAX_RECORDING_SECONDS * 1000);
  };

  const playRecording = async () => {
    if (!audioUrl) return;

    const mobile = isMobile();
    console.log('Playing recording on mobile device:', mobile);

    try {
      if (mobile) {
        // Mobile-specific approach: create fresh audio element
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = audioUrl;
        audio.volume = 1.0;

        // Store reference for cleanup
        audioRef.current = audio;

        // Wait for audio to be ready
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Audio loading timeout')), 2000);

          audio.addEventListener('canplaythrough', () => {
            clearTimeout(timeout);
            resolve(true);
          }, { once: true });

          audio.addEventListener('error', (e) => {
            clearTimeout(timeout);
            reject(e);
          }, { once: true });
        });

        // Play the audio
        await audio.play();
      } else {
        // Desktop approach: reuse audio element
        if (!audioRef.current) {
          audioRef.current = new Audio();
          audioRef.current.preload = 'auto';
        }

        audioRef.current.src = audioUrl;
        if (audioRef.current.currentTime > 0) {
          audioRef.current.currentTime = 0;
        }

        await audioRef.current.play();
      }

    } catch (error) {
      console.error('Failed to play recording:', error);
      setIsPlaying(false);

      // Final fallback: try with immediate play
      try {
        const fallbackAudio = new Audio(audioUrl);
        fallbackAudio.volume = 1.0;
        await fallbackAudio.play();
      } catch (fallbackError) {
        console.error('Fallback playback also failed:', fallbackError);
        toast({
          title: "Playback Error",
          description: "Failed to play recording. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setAudioUrl(null);
    setRecordingStatus('idle');
    setIsPlaying(false);
  };

  if (recordingStatus === 'permission_denied') {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" disabled>
                        <AlertCircle className="text-destructive" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Microphone access was denied.</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {recordingStatus === 'idle' && (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={startRecording}>
                        <Mic />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Record your voice</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      )}

      {recordingStatus === 'recording' && (
        <div className="relative flex items-center justify-center">
            <Button variant="destructive" size="icon" onClick={stopRecording} className="animate-pulse">
                <Square />
            </Button>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-destructive-foreground font-bold text-sm">{countdown}</span>
            </div>
        </div>
      )}

      {recordingStatus === 'recorded' && (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={playRecording}
                            disabled={isPlaying}
                        >
                            <Play className="text-green-500" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{isPlaying ? 'Playing...' : 'Play recording'}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            {isMobile() ? (
                <Button variant="ghost" size="icon" onClick={deleteRecording}>
                    <Trash2 className="text-destructive" />
                </Button>
            ) : (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={deleteRecording}>
                                <Trash2 className="text-destructive" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Delete recording</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </>
      )}
    </div>
  );
}
