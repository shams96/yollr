'use client'

import { useEffect, useRef, useState } from 'react'

interface CameraCaptureProps {
  onVideoCapture: (blob: Blob) => void
  maxDuration?: number // seconds
}

export function CameraCapture({ onVideoCapture, maxDuration = 15 }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const [recording, setRecording] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(maxDuration)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: true,
        })

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setCameraActive(true)
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to access camera'
        setCameraError(message)
        console.error('Camera error:', error)
      }
    }

    initCamera()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const startRecording = () => {
    if (!streamRef.current || recording) return

    try {
      chunksRef.current = []
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9',
      })

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        onVideoCapture(blob)
        chunksRef.current = []
      }

      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setRecording(true)
      setTimeRemaining(maxDuration)

      // Start countdown timer
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            stopRecording()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      setCameraError(error instanceof Error ? error.message : 'Failed to start recording')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  return (
    <div className="w-full space-y-4">
      {cameraError ? (
        <div className="bg-danger-red/20 border border-danger-red rounded-card p-6 text-center">
          <p className="text-danger-red font-medium mb-2">📷 Camera Error</p>
          <p className="text-sm text-danger-red/80">{cameraError}</p>
          <p className="text-xs text-danger-red/60 mt-2">Please check permissions and try again</p>
        </div>
      ) : cameraActive ? (
        <div className="space-y-4">
          {/* Video Preview */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full aspect-video bg-ink-black rounded-card object-cover"
          />

          {/* Timer */}
          {recording && (
            <div className="flex items-center justify-center gap-2 bg-danger-red/20 rounded-card p-3">
              <div className="animate-pulse">🔴</div>
              <span className="font-mono font-semibold text-danger-red">
                {timeRemaining}s remaining
              </span>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-3">
            {!recording ? (
              <button
                onClick={startRecording}
                className="flex-1 bg-danger-red hover:bg-danger-red/90 text-pure-snow font-semibold py-3 rounded-card transition disabled:opacity-50"
              >
                🔴 Record
              </button>
            ) : (
              <>
                <button
                  onClick={stopRecording}
                  className="flex-1 bg-success-green hover:bg-success-green/90 text-ink-black font-semibold py-3 rounded-card transition"
                >
                  ✓ Done
                </button>
                <button
                  onClick={stopRecording}
                  className="flex-1 bg-slate-shadow hover:bg-slate-shadow/80 text-pure-snow font-semibold py-3 rounded-card transition border border-slate-shadow/50"
                >
                  ✕ Cancel
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-slate-shadow animate-pulse">Loading camera...</p>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}
