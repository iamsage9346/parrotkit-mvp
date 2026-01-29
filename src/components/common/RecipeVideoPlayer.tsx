'use client';

import React, { useRef, useEffect, useState } from 'react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface RecipeVideoPlayerProps {
  videoUrl: string;
  scene: {
    id: number;
    title: string;
    startTime: string;
    endTime: string;
    thumbnail?: string;
    description?: string;
  };
  scriptLines?: string[];
  onSwitchToShooting: () => void;
}

function timeToSeconds(time: string): number {
  const [mins, secs] = time.split(':').map(Number);
  return mins * 60 + secs;
}

function extractVideoId(url: string): string {
  const patterns = [
    /shorts\/([a-zA-Z0-9_-]+)/,
    /watch\?v=([a-zA-Z0-9_-]+)/,
    /youtu\.be\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return '';
}

export const RecipeVideoPlayer: React.FC<RecipeVideoPlayerProps> = ({
  videoUrl,
  scene,
  scriptLines,
  onSwitchToShooting,
}) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playerError, setPlayerError] = useState(false);
  const [scriptOpen, setScriptOpen] = useState(false);
  const videoId = extractVideoId(videoUrl);
  const startSeconds = timeToSeconds(scene.startTime);
  const endSeconds = timeToSeconds(scene.endTime);
  const duration = endSeconds - startSeconds;

  useEffect(() => {
    let player: any = null;
    let checkInterval: NodeJS.Timeout | null = null;
    let progressInterval: NodeJS.Timeout | null = null;
    let mounted = true;

    setPlayerError(false);

    const initPlayer = () => {
      if (!mounted) return;
      if (!window.YT || !window.YT.Player) {
        return;
      }

      const container = document.getElementById('youtube-player');
      if (!container) {
        setTimeout(initPlayer, 100);
        return;
      }

      try {
        player = new window.YT.Player('youtube-player', {
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            controls: 1,
            playsinline: 1,
            modestbranding: 1,
            rel: 0,
            start: startSeconds,
            end: endSeconds,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              if (!mounted) return;
              event.target.mute();
              event.target.seekTo(startSeconds);
              event.target.playVideo();

              progressInterval = setInterval(() => {
                if (!mounted || !player || !player.getCurrentTime) return;
                try {
                  const current = player.getCurrentTime();
                  const elapsed = current - startSeconds;

                  if (elapsed >= 0 && elapsed <= duration) {
                    setCurrentTime(elapsed);
                    setProgress((elapsed / duration) * 100);
                  }
                } catch (e) {
                  // ignore
                }
              }, 100);
            },
            onStateChange: (event: any) => {
              if (!mounted) return;
              if (event.data === window.YT.PlayerState.PLAYING) {
                if (checkInterval) clearInterval(checkInterval);
                checkInterval = setInterval(() => {
                  if (!mounted || !player || !player.getCurrentTime) return;
                  try {
                    const current = player.getCurrentTime();
                    if (current >= endSeconds) {
                      player.seekTo(startSeconds);
                    }
                  } catch (e) {
                    // ignore
                  }
                }, 100);
              }
            },
            onError: () => {
              if (!mounted) return;
              setPlayerError(true);
            },
          },
        });
        playerRef.current = player;
      } catch (error) {
        console.error('Error initializing YouTube player:', error);
        setPlayerError(true);
      }
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }

      window.onYouTubeIframeAPIReady = () => {
        setTimeout(initPlayer, 200);
      };
    } else if (window.YT.Player) {
      setTimeout(initPlayer, 100);
    }

    return () => {
      mounted = false;
      if (checkInterval) clearInterval(checkInterval);
      if (progressInterval) clearInterval(progressInterval);
      if (player && player.destroy) {
        try {
          player.destroy();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [videoId, scene.id, startSeconds, endSeconds, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const thumbnailUrl = scene.thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      <div className="relative w-full h-full max-w-md mx-auto" ref={containerRef}>
        {/* YouTube Player or Fallback */}
        {playerError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
            <img
              src={thumbnailUrl}
              alt={scene.title}
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            <div className="relative z-10 text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <div className="w-0 h-0 border-l-[24px] border-l-white border-t-[14px] border-t-transparent border-b-[14px] border-b-transparent ml-1" />
              </div>
              <p className="text-white text-sm mb-2">This video cannot be embedded.</p>
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Watch on YouTube
              </a>
            </div>
          </div>
        ) : (
          <div id="youtube-player" className="absolute inset-0 w-full h-full" />
        )}

        {/* Loop indicator */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-white text-sm font-medium">Loop</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute top-4 left-4 right-20 z-10">
          <div className="bg-black/70 backdrop-blur-sm rounded-xl px-3 py-2">
            <div className="flex items-center justify-between text-white text-xs mb-1">
              <span>{formatTime(startSeconds + currentTime)}</span>
              <span>{scene.startTime} ~ {scene.endTime}</span>
            </div>
            <div className="w-full bg-gray-600/50 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
          <button
            onClick={() => setScriptOpen(true)}
            className="px-4 py-2.5 bg-white/95 backdrop-blur-sm text-gray-900 rounded-xl font-semibold shadow-lg text-sm flex items-center gap-2"
          >
            <img src="/parrot-logo.png" alt="" className="w-5 h-5" />
            대본 보기
          </button>
          <button
            onClick={onSwitchToShooting}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold shadow-2xl hover:from-blue-600 hover:to-blue-700 transition-all"
          >
            촬영하기
          </button>
        </div>

        {/* Script Bottom Sheet */}
        {scriptOpen && (
          <div className="absolute inset-0 z-20" onClick={() => setScriptOpen(false)}>
            <div className="absolute inset-0 bg-black/40" />
            <div
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl animate-slide-up"
              onClick={(e) => e.stopPropagation()}
              style={{ maxHeight: '70%' }}
            >
              {/* Drag Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <img src="/parrot-logo.png" alt="Parrot Kit" className="w-6 h-6" />
                  <span className="font-bold text-gray-900 text-base">대본 - #{scene.id}: {scene.title}</span>
                </div>
                <button
                  onClick={() => setScriptOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                </button>
              </div>

              {/* Script Content */}
              <div className="overflow-y-auto p-5 space-y-3" style={{ maxHeight: 'calc(70vh - 80px)' }}>
                {(scriptLines || [scene.description || 'Follow the reference video']).map((line, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-bold">{idx + 1}</span>
                    <p className="text-gray-800 text-sm font-medium leading-relaxed">{line}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
