"use client";

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type RecordingStatus = 'idle' | 'permission_denied' | 'recording' | 'recorded';

export function VoiceRecorder() {
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      // Clean up URL object when component unmounts
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);


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

  const startRecording = async () => {
    const stream = await requestMicPermission();
    if (!stream) return;

    setRecordingStatus('recording');
    audioChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);
      setAudioBlob(audioBlob);
      setRecordingStatus('recorded');
       // Stop all tracks on the stream to turn off the mic indicator
       stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.start();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const playRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingStatus('idle');
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
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="destructive" size="icon" onClick={stopRecording} className="animate-pulse">
                        <Square />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Stop recording</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      )}
      
      {recordingStatus === 'recorded' && (
        <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={playRecording}>
                            <Play className="text-green-500" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Play recording</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
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
        </>
      )}
    </div>
  );
}
