'use client';

import React, { useRef, useState, useEffect } from 'react';

interface CameraShootingProps {
  sceneId: number;
  sceneTitle: string;
  instructions: string[];
  onCapture: (videoBlob: Blob) => void;
  onBack: () => void;
  embedded?: boolean; // 탭 내에서 사용될 때
}

export const CameraShooting: React.FC<CameraShootingProps> = ({
  sceneId,
  sceneTitle,
  instructions,
  onCapture,
  onBack,
  embedded = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera access error:', error);
      alert('카메라 접근 권한이 필요합니다.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const startRecording = () => {
    if (!videoRef.current?.srcObject) return;

    const stream = videoRef.current.srcObject as MediaStream;
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm',
    });

    mediaRecorderRef.current = mediaRecorder;
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      onCapture(blob);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleShootButton = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const containerClass = embedded
    ? 'relative w-full h-full bg-black'
    : 'fixed inset-0 bg-black z-50';

  return (
    <div className={containerClass}>
      {/* Video Preview */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Guidelines Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-0">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="border border-white/20" />
          ))}
        </div>

        <div className="relative">
          <div className="w-48 h-48 rounded-full border-4 border-yellow-400/70 flex items-center justify-center">
            <div className="text-yellow-400 text-6xl">😊</div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="bg-blue-400/90 backdrop-blur-sm rounded-2xl p-4 space-y-2">
          {instructions.map((instruction, idx) => (
            <p key={idx} className="text-white text-sm font-medium">
              {instruction}
            </p>
          ))}
        </div>
      </div>

      {/* Scene Info */}
      <div className="absolute bottom-32 left-4 right-4 z-20">
        <div className="bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 rounded-lg" />
            <span className="text-white font-medium text-sm">
              Introduction ... +
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-0 right-0 z-20">
        <div className="flex items-center justify-center">
          <button
            onClick={handleShootButton}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-red-500 scale-90'
                : 'bg-white border-4 border-red-500'
            }`}
          >
            {isRecording && (
              <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping" />
            )}
            {!isRecording && <div className="w-16 h-16 rounded-full bg-red-500" />}
          </button>
        </div>
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center gap-2 bg-red-500 px-3 py-1.5 rounded-full">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="text-white text-sm font-bold">REC</span>
          </div>
        </div>
      )}
    </div>
  );
};
