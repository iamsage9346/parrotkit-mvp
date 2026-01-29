'use client';

import React, { useRef, useState, useEffect } from 'react';

interface CameraShootingProps {
  sceneId: number;
  sceneTitle: string;
  instructions: string[];
  onCapture: (videoBlob: Blob) => void;
  onBack: () => void;
  embedded?: boolean;
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
  const [scriptOpen, setScriptOpen] = useState(false);

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

      {/* Recording Indicator */}
      {isRecording && (
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center gap-2 bg-red-500 px-3 py-1.5 rounded-full">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="text-white text-sm font-bold">REC</span>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-0 right-0 z-20">
        <div className="flex items-center justify-center gap-6">
          {/* Script Button */}
          <button
            onClick={() => setScriptOpen(true)}
            className="px-4 py-2.5 bg-white/95 backdrop-blur-sm text-gray-900 rounded-xl font-semibold shadow-lg text-sm flex items-center gap-2"
          >
            <img src="/parrot-logo.png" alt="" className="w-5 h-5" />
            Script
          </button>

          {/* Record Button */}
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

          {/* Spacer for symmetry */}
          <div className="w-[72px]" />
        </div>
      </div>

      {/* Script Bottom Sheet */}
      {scriptOpen && (
        <div className="absolute inset-0 z-30" onClick={() => setScriptOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: '60%' }}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <img src="/parrot-logo.png" alt="Parrot Kit" className="w-6 h-6" />
                <span className="font-bold text-gray-900 text-base">Script - #{sceneId}: {sceneTitle}</span>
              </div>
              <button
                onClick={() => setScriptOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>

            {/* Script Content */}
            <div className="overflow-y-auto p-5 space-y-3" style={{ maxHeight: 'calc(60vh - 80px)' }}>
              {instructions.map((instruction, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-bold">{idx + 1}</span>
                  <p className="text-gray-800 text-sm font-medium leading-relaxed">{instruction}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
