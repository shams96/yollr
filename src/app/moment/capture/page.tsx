'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Camera, Video, Square, RotateCcw, Check, X, Clock, Zap } from 'lucide-react';

export default function MomentCapturePage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isYollrBell, setIsYollrBell] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes for Yollr Bell
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Check if this is a Yollr Bell moment
    const searchParams = new URLSearchParams(window.location.search);
    const bellParam = searchParams.get('bell');
    setIsYollrBell(bellParam === 'true');

    // Start camera
    startCamera();

    // Yollr Bell countdown
    if (bellParam === 'true') {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push('/feed');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
      router.push('/feed');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm;codecs=vp8,opus',
      videoBitsPerSecond: 2500000 // 2.5 Mbps for good quality
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      setIsPreview(true);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);

    // Countdown timer (15 seconds max)
    let seconds = 15;
    const countdownTimer = setInterval(() => {
      seconds--;
      setCountdown(seconds);
      
      if (seconds <= 0) {
        clearInterval(countdownTimer);
        stopRecording();
      }
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setCountdown(null);
    }
  };

  const retake = () => {
    setRecordedBlob(null);
    setIsPreview(false);
    startCamera();
  };

  const uploadMoment = async () => {
    if (!recordedBlob) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Get user's campus
      const { data: membership } = await supabase
        .from('campus_memberships')
        .select('campus_id')
        .eq('user_id', user.id)
        .is('left_at', null)
        .single();

      if (!membership) {
        router.push('/onboarding/campus');
        return;
      }

      // Upload video to Supabase Storage
      const fileName = `${user.id}-${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from('moments')
        .upload(fileName, recordedBlob);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('moments')
        .getPublicUrl(fileName);

      // Create moment record
      const { error: dbError } = await supabase
        .from('moments')
        .insert({
          campus_id: membership.campus_id,
          user_id: user.id,
          video_url: publicUrl,
          source: isYollrBell ? 'yollr_bell' : 'camera',
          caption: null, // Could add caption input in future
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        } as any);

      if (dbError) throw dbError;

      // Award XP
      await supabase.rpc('award_xp', {
        user_id: user.id,
        amount: isYollrBell ? 50 : 25,
        reason: isYollrBell ? 'yollr_bell_moment' : 'moment_posted',
      } as any);

      // Update streak if Yollr Bell
      if (isYollrBell) {
        await supabase.rpc('update_streak', {
          user_id: user.id,
          streak_type: 'yollr_bell',
        } as any);
      }

      router.push('/feed');
    } catch (error) {
      console.error('Error uploading moment:', error);
      alert('Failed to upload moment. Please try again.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isPreview && recordedBlob) {
    return (
      <div className="min-h-screen bg-midnight flex flex-col">
        {/* Preview */}
        <div className="flex-1 flex items-center justify-center p-4">
          <video
            src={URL.createObjectURL(recordedBlob)}
            className="w-full max-w-md rounded-lg"
            controls
            autoPlay
            loop
          />
        </div>

        {/* Action buttons */}
        <div className="p-4 space-y-3">
          <button
            onClick={uploadMoment}
            className="w-full py-4 gradient-btn text-white font-bold rounded-lg haptic-tap"
          >
            Share Moment
          </button>
          <button
            onClick={retake}
            className="w-full py-4 glass-card text-cloud font-bold rounded-lg haptic-tap"
          >
            Retake
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <button
          onClick={() => router.push('/feed')}
          className="text-cloud hover:text-cosmic-pink transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
        
        {isYollrBell && (
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-cosmic-pink animate-pulse" />
            <span className="text-sm font-bold text-cosmic-pink">
              {formatTime(timeRemaining)}
            </span>
          </div>
        )}
        
        <div className="w-6" /> {/* Spacer for centering */}
      </div>

      {/* Camera view */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
        
        {/* Countdown overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="text-6xl font-black text-white">
              {countdown}
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-6">
        <div className="flex items-center justify-center space-x-8">
          {!isRecording ? (
            <>
              <button
                onClick={() => router.push('/feed')}
                className="p-3 glass-card text-cloud rounded-full haptic-tap"
              >
                <X className="h-6 w-6" />
              </button>
              
              <button
                onClick={startRecording}
                className="p-4 bg-red-500 rounded-full haptic-tap animate-pulse"
              >
                <Video className="h-8 w-8 text-white" />
              </button>
              
              <button
                onClick={startCamera}
                className="p-3 glass-card text-cloud rounded-full haptic-tap"
              >
                <RotateCcw className="h-6 w-6" />
              </button>
            </>
          ) : (
            <button
              onClick={stopRecording}
              className="p-4 bg-white rounded-full haptic-tap"
            >
              <Square className="h-8 w-8 text-red-500" />
            </button>
          )}
        </div>
        
        <p className="text-center text-sm text-cloud/60 mt-4">
          {isRecording ? 'Recording...' : 'Tap to record (15s max)'}
        </p>
      </div>
    </div>
  );
}