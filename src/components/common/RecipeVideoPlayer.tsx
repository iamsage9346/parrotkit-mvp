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
  };
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
  onSwitchToShooting,
}) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const videoId = extractVideoId(videoUrl);
  const startSeconds = timeToSeconds(scene.startTime);
  const endSeconds = timeToSeconds(scene.endTime);
  const duration = endSeconds - startSeconds;

  useEffect(() => {
    let player: any = null;
    let checkInterval: NodeJS.Timeout | null = null;
    let progressInterval: NodeJS.Timeout | null = null;
    let mounted = true;

    const initPlayer = () => {
      if (!mounted) return;
      if (!window.YT || !window.YT.Player) {
        console.log('YouTube API not ready yet');
        return;
      }

      const container = document.getElementById('youtube-player');
      if (!container) {
        console.log('Container not found, retrying...');
        setTimeout(initPlayer, 100);
        return;
      }

      try {
        player = new window.YT.Player('youtube-player', {
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            start: startSeconds,
          },
          events: {
            onReady: (event: any) => {
              if (!mounted) return;
              event.target.mute();
              event.target.seekTo(startSeconds);
              event.target.playVideo();
              
              // 프로그레스 트래킹 시작
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
                // 루프 체크 시작
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
          },
        });
        playerRef.current = player;
      } catch (error) {
        console.error('Error initializing YouTube player:', error);
      }
    };

    // YouTube API 로드
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

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      <div className="relative w-full h-full max-w-md mx-auto" ref={containerRef}>
        {/* YouTube Player */}
        <div id="youtube-player" className="absolute inset-0 w-full h-full" />

        {/* Loop indicator */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-white text-sm font-medium">Loop</span>
          </div>
        </div>

        {/* Overlay Instructions */}
        <div className="absolute top-20 left-4 right-4 z-10">
          <div className="bg-blue-400/90 backdrop-blur-sm rounded-2xl p-4 space-y-2">
            <p className="text-white text-sm font-medium">
              Drop the phone from head to slightly under the chest
            </p>
            <p className="text-white text-sm font-medium">
              Stop when your face is in the middle of the frame
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-32 left-0 right-0 z-10 px-4">
          <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center justify-between text-white text-sm mb-2">
              <span>{formatTime(startSeconds + currentTime)}</span>
              <span>{scene.startTime} ~ {scene.endTime}</span>
            </div>
            
            <div className="w-full bg-gray-600/50 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scene Info */}
        <div className="absolute bottom-16 left-4 right-4 z-10">
          <div className="bg-black/70 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 rounded-lg" />
              <div>
                <h3 className="text-white font-bold text-sm">#{scene.id}: {scene.title}</h3>
                <p className="text-gray-300 text-xs">Introduction ... <span className="text-blue-400">+</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10">
          <button
            onClick={onSwitchToShooting}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold shadow-2xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
          >
            Click the shooting button →
          </button>
        </div>
      </div>
    </div>
  );
};
