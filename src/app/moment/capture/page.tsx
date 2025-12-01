'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Video, Square, X, Zap, RefreshCw, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type CameraFacing = 'user' | 'environment';

export default function MomentCapturePage() {
  const router = useRouter();
  const supabase = createClient();

  // Intro screen state
  const [showIntro, setShowIntro] = useState(true);
  const [introColor, setIntroColor] = useState('');

  // Camera states
  const [cameraFacing, setCameraFacing] = useState<CameraFacing>('user');
  const [isRecording, setIsRecording] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Yollr Bell states
  const [isYollrBell, setIsYollrBell] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes for Yollr Bell

  // Execution Week detection
  const [isExecutionWeek, setIsExecutionWeek] = useState(false);
  const [heistTitle, setHeistTitle] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Set random intro background color
    const colors = [
      'bg-accent-honey', // Honey yellow
      'bg-accent-mint', // Mint green
      'bg-accent-lilac', // Lilac purple
      'bg-accent-sky', // Sky blue
      'bg-accent-coral', // Coral pink
    ];
    setIntroColor(colors[Math.floor(Math.random() * colors.length)]);

    // Check if this is a Yollr Bell moment
    const searchParams = new URLSearchParams(window.location.search);
    const bellParam = searchParams.get('bell');
    setIsYollrBell(bellParam === 'true');

    // Check if we're in Execution Week
    checkExecutionWeek();

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

      return () => clearInterval(timer);
    }
  }, []);

  const checkExecutionWeek = async () => {
    try {
      // Fetch current heist to check if we're in execution phase
      const campusId = '00000000-0000-0000-0000-000000000000'; // TODO: Get from user profile
      const response = await fetch(`/api/heist/current?campusId=${campusId}`);
      const data = await response.json();

      if (data.heist && data.heist.phase === 'executing') {
        setIsExecutionWeek(true);
        setHeistTitle(data.heist.title);
      }
    } catch (error) {
      console.error('Error checking execution week:', error);
    }
  };

  const startCamera = async (facing: CameraFacing = cameraFacing) => {
    try {
      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media devices not supported. Please use HTTPS or a supported browser.');
      }

      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Enhanced video and audio constraints for better quality
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
          aspectRatio: { ideal: 16/9 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: { ideal: 48000 },
          channelCount: { ideal: 2 }
        }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);

      let errorMessage = 'Unable to access camera. ';

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage += 'Please allow camera and microphone permissions.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage += 'Camera is already in use by another application.';
      } else if (error.message.includes('Media devices not supported')) {
        errorMessage += 'Please access this page via HTTPS or use a supported browser.';
      } else {
        errorMessage += 'Please check permissions and try again.';
      }

      alert(errorMessage);
      router.push('/feed');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const toggleCamera = async () => {
    const newFacing: CameraFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(newFacing);
    await startCamera(newFacing);
  };

  const handleStartCapture = () => {
    setShowIntro(false);
    startCamera();
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    chunksRef.current = [];

    // Enhanced recording options for better quality
    const options: MediaRecorderOptions = {
      videoBitsPerSecond: 5000000, // 5 Mbps for high quality
      audioBitsPerSecond: 128000, // 128 kbps for audio
    };

    // Try to use best available codec
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
      options.mimeType = 'video/webm;codecs=vp9,opus';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
      options.mimeType = 'video/webm;codecs=vp8,opus';
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      options.mimeType = 'video/webm';
    }

    const mediaRecorder = new MediaRecorder(streamRef.current, options);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const mimeType = mediaRecorder.mimeType || 'video/webm';
      const blob = new Blob(chunksRef.current, { type: mimeType });
      setRecordedBlob(blob);
      setIsPreview(true);
      stopCamera();
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
        .single() as { data: { campus_id: string } | null };

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

      // Auto-generate caption for execution week
      const caption = isExecutionWeek ? `#ThisWeeksHeist ${heistTitle}` : null;

      // Create moment record
      const { error: dbError } = await supabase
        .from('moments')
        .insert({
          campus_id: membership.campus_id,
          user_id: user.id,
          video_url: publicUrl,
          source: isYollrBell ? 'yollr_bell' : 'camera',
          caption: caption,
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

  const getFlavorText = () => {
    if (isYollrBell) return "It's Yollr Bell time! 🔔";
    if (isExecutionWeek) return "Capture this week's heist! 🎬";
    const texts = [
      "Show us what you're up to 📸",
      "Capture your vibe right now ✨",
      "What's happening on campus? 👀",
      "Time to share a moment 🎥",
      "Your friends are waiting 💫"
    ];
    return texts[Math.floor(Math.random() * texts.length)];
  };

  // TBH-style intro screen
  if (showIntro) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`min-h-screen ${introColor} flex flex-col items-center justify-center p-8 relative`}
      >
        <button
          type="button"
          onClick={() => router.push('/feed')}
          className="absolute top-6 left-6 text-white/80 hover:text-white transition-colors"
          aria-label="Close and return to feed"
        >
          <X className="h-8 w-8" />
        </button>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring' }}
          className="text-center space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-white font-black text-6xl tracking-tight">
              Capture a<br/>Moment 📸
            </h1>
            <p className="text-white/90 text-xl font-medium">
              {getFlavorText()}
            </p>
          </div>

          {isYollrBell && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-6"
            >
              <div className="flex items-center justify-center gap-3 text-white">
                <Zap className="h-8 w-8 animate-pulse" />
                <span className="text-3xl font-black">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </motion.div>
          )}

          {isExecutionWeek && (
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white font-bold text-sm">
                Auto-tagged: #ThisWeeksHeist
              </p>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartCapture}
            className="bg-white text-gray-900 font-black text-xl px-12 py-5 rounded-full shadow-2xl hover:shadow-3xl transition-all"
          >
            Let's Go →
          </motion.button>

          <p className="text-white/70 text-sm font-medium">
            {cameraFacing === 'user' ? 'Front camera' : 'Back camera'} • 15s max
          </p>
        </motion.div>
      </motion.div>
    );
  }

  // Preview screen
  if (isPreview && recordedBlob) {
    return (
      <div className="min-h-screen bg-midnight flex flex-col">
        {/* Preview */}
        <div className="flex-1 flex items-center justify-center p-4 bg-black">
          <video
            src={URL.createObjectURL(recordedBlob)}
            className="w-full max-w-md rounded-2xl shadow-2xl"
            controls
            autoPlay
            loop
          />
        </div>

        {/* Action buttons */}
        <div className="p-6 space-y-3 bg-midnight">
          {isExecutionWeek && (
            <div className="bg-accent-honey/10 border border-accent-honey/30 rounded-xl p-3 mb-2">
              <p className="text-accent-honey font-bold text-sm text-center">
                Tagged with: #ThisWeeksHeist {heistTitle}
              </p>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={uploadMoment}
            className="w-full py-4 gradient-btn text-white font-bold rounded-xl haptic-tap flex items-center justify-center gap-2"
          >
            <Send className="h-5 w-5" />
            Share Moment
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={retake}
            className="w-full py-4 glass-card text-cloud font-bold rounded-xl haptic-tap"
          >
            Retake
          </motion.button>
        </div>
      </div>
    );
  }

  // Camera screen
  return (
    <div className="min-h-screen bg-midnight flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/feed')}
          className="text-white hover:text-cosmic-pink transition-colors backdrop-blur-sm bg-black/30 rounded-full p-2"
          aria-label="Close and return to feed"
        >
          <X className="h-6 w-6" />
        </button>

        {isYollrBell && (
          <div className="flex items-center space-x-2 backdrop-blur-sm bg-black/30 rounded-full px-4 py-2">
            <Zap className="h-4 w-4 text-cosmic-pink animate-pulse" />
            <span className="text-sm font-bold text-white">
              {formatTime(timeRemaining)}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={toggleCamera}
          className="text-white hover:text-cosmic-pink transition-colors backdrop-blur-sm bg-black/30 rounded-full p-2"
          aria-label="Toggle front/back camera"
        >
          <RefreshCw className="h-6 w-6" />
        </button>
      </div>

      {/* Camera view */}
      <div className="flex-1 relative bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />

        {/* Countdown overlay */}
        <AnimatePresence>
          {countdown !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="absolute inset-0 flex items-center justify-center bg-black/60"
            >
              <motion.span
                key={countdown}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-8xl font-black text-white"
              >
                {countdown}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Shoulder cam flavor text */}
        <div className="absolute bottom-24 left-0 right-0 flex justify-center px-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="backdrop-blur-sm bg-black/40 rounded-2xl px-6 py-3"
          >
            <p className="text-white font-bold text-sm text-center">
              {cameraFacing === 'user' ? '📸 Front camera' : '🎥 Back camera'} • {getFlavorText()}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 bg-midnight">
        <div className="flex items-center justify-center space-x-12">
          {!isRecording ? (
            <>
              <div className="w-12" /> {/* Spacer */}

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={startRecording}
                className="relative p-2 bg-red-500 rounded-full haptic-tap shadow-2xl"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 bg-red-500 rounded-full opacity-50"
                />
                <Video className="h-10 w-10 text-white relative z-10" />
              </motion.button>

              <div className="w-12" /> {/* Spacer */}
            </>
          ) : (
            <motion.button
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.9 }}
              onClick={stopRecording}
              className="p-4 bg-white rounded-full haptic-tap shadow-2xl"
            >
              <Square className="h-8 w-8 text-red-500 fill-red-500" />
            </motion.button>
          )}
        </div>

        <p className="text-center text-sm text-cloud/70 mt-4 font-medium">
          {isRecording ? `Recording... ${countdown}s` : 'Tap to record (15s max)'}
        </p>
      </div>
    </div>
  );
}
