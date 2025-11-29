'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, FlipHorizontal, Circle, RotateCcw, Check, Upload } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface MomentCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture?: (videoBlob: Blob, caption: string, tags: string[]) => Promise<void>;
  isBellMoment?: boolean;
  autoTags?: string[];
}

type CaptureState = 'idle' | 'recording' | 'preview' | 'uploading';

/**
 * MomentCaptureModal - Full-screen camera capture UI
 * Features: 15-sec limit, flip camera, timer, preview, retake, upload
 */
export function MomentCaptureModal({
  isOpen,
  onClose,
  onCapture,
  isBellMoment = false,
  autoTags = [],
}: MomentCaptureModalProps) {
  const [state, setState] = useState<CaptureState>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState<string[]>(autoTags);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_DURATION = 15; // seconds

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      resetState();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      streamRef.current = stream;
    } catch (error) {
      console.error('Camera access denied:', error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm',
    });

    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      setVideoBlob(blob);
      setVideoUrl(URL.createObjectURL(blob));
      setState('preview');
      stopCamera();
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setState('recording');
    setRecordingTime(0);

    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        const next = prev + 1;
        if (next >= MAX_DURATION) {
          stopRecording();
        }
        return next;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const retake = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoBlob(null);
    setVideoUrl(null);
    setState('idle');
    startCamera();
  };

  const handleSubmit = async () => {
    if (!videoBlob || !onCapture) return;

    setState('uploading');
    try {
      await onCapture(videoBlob, caption, tags);
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
      setState('preview');
    }
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const resetState = () => {
    setState('idle');
    setRecordingTime(0);
    setVideoBlob(null);
    setVideoUrl(null);
    setCaption('');
    setTags(autoTags);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-obsidian"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-glass-heavy backdrop-blur-md text-white hover:bg-glass-medium transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Bell Badge */}
          {isBellMoment && (
            <motion.div
              className="absolute top-4 left-4 z-10 px-3 py-2 rounded-full bg-lime-zing text-obsidian font-bold text-sm flex items-center gap-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              🔔 Yollr Bell
            </motion.div>
          )}

          {/* Video Display */}
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            {state === 'preview' && videoUrl ? (
              <video
                src={videoUrl}
                controls
                autoPlay
                loop
                className="w-full h-full object-contain"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={cn(
                  'w-full h-full object-cover',
                  facingMode === 'user' && 'scale-x-[-1]'
                )}
              />
            )}

            {/* Recording Timer */}
            {state === 'recording' && (
              <motion.div
                className="absolute top-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-error/90 backdrop-blur-md text-white font-bold text-lg flex items-center gap-2"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <motion.div
                  className="w-3 h-3 rounded-full bg-white"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                {recordingTime}s / {MAX_DURATION}s
              </motion.div>
            )}

            {/* Progress Bar */}
            {state === 'recording' && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-glass-light">
                <motion.div
                  className="h-full bg-error"
                  initial={{ width: '0%' }}
                  animate={{ width: `${(recordingTime / MAX_DURATION) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 pb-8 pt-4 bg-gradient-to-t from-obsidian via-obsidian/90 to-transparent">
            {state === 'idle' || state === 'recording' ? (
              <div className="flex items-center justify-center gap-8">
                {/* Flip Camera */}
                {state === 'idle' && (
                  <motion.button
                    onClick={toggleCamera}
                    className="p-4 rounded-full bg-glass-medium hover:bg-glass-heavy text-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FlipHorizontal className="w-6 h-6" />
                  </motion.button>
                )}

                {/* Record/Stop Button */}
                <motion.button
                  onClick={state === 'idle' ? startRecording : stopRecording}
                  className={cn(
                    'relative w-20 h-20 rounded-full flex items-center justify-center transition-all',
                    state === 'recording'
                      ? 'bg-error shadow-error/50 shadow-2xl'
                      : 'bg-white'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {state === 'recording' ? (
                    <div className="w-8 h-8 bg-white rounded" />
                  ) : (
                    <Circle className="w-16 h-16 text-error" strokeWidth={3} />
                  )}
                </motion.button>

                <div className="w-16" />
              </div>
            ) : state === 'preview' ? (
              <div className="space-y-4">
                {/* Caption Input */}
                <div className="max-w-md mx-auto px-4">
                  <input
                    type="text"
                    placeholder="Add a caption..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-glass-medium border border-glass-light text-white placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-coral"
                    maxLength={200}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-4 px-4">
                  <motion.button
                    onClick={retake}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg bg-glass-medium hover:bg-glass-heavy text-white font-semibold transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <RotateCcw className="w-5 h-5" />
                    Retake
                  </motion.button>

                  <motion.button
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-coral to-hyper-pink text-white font-bold shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Check className="w-5 h-5" />
                    Post Moment
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2 text-white">
                  <Upload className="w-5 h-5 animate-pulse" />
                  <span className="font-medium">Uploading...</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
