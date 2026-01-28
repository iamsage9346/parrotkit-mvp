import { NextRequest, NextResponse } from 'next/server';
import ytdl from 'ytdl-core';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // YouTube URL 유효성 검사
    if (!ytdl.validateURL(url)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    // 비디오 정보 가져오기
    const info = await ytdl.getInfo(url);
    const videoDetails = info.videoDetails;
    
    // 비디오 ID 추출
    const videoId = videoDetails.videoId;
    
    // 실제 비디오 길이 (초 단위)
    const totalDuration = parseInt(videoDetails.lengthSeconds);
    
    // 4초씩 자르기
    const sceneDuration = 4;
    const sceneCount = Math.ceil(totalDuration / sceneDuration);
    
    // 영상 흐름에 맞는 씬 이름 (최대 10개까지만 정의)
    const sceneNames = [
      'Hook',
      'Introduction', 
      'Context',
      'Build Up',
      'Peak',
      'Transition',
      'Development',
      'Climax',
      'Resolution',
      'Outro'
    ];
    
    const sceneDescriptions = [
      'Opening hook',
      'Set the scene',
      'Provide context',
      'Build tension',
      'Peak moment',
      'Shift focus',
      'Continue story',
      'Main climax',
      'Wrap up',
      'Final message'
    ];
    
    const scenes = [];
    
    for (let i = 0; i < sceneCount; i++) {
      const startTime = i * sceneDuration;
      const endTime = Math.min((i + 1) * sceneDuration, totalDuration); // 마지막 씬은 실제 길이까지만
      
      scenes.push({
        id: i + 1,
        title: sceneNames[i] || `Scene ${i + 1}`,
        startTime: formatTime(startTime),
        endTime: formatTime(endTime),
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        description: sceneDescriptions[i] || `Scene ${i + 1}`,
        progress: 0,
      });
    }

    function formatTime(seconds: number): string {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return NextResponse.json({
      success: true,
      videoId,
      url,
      scenes,
      metadata: {
        title: videoDetails.title || 'YouTube Video',
        duration: formatTime(totalDuration),
        platform: url.includes('shorts') ? 'YouTube Shorts' : 'YouTube',
      },
    });
  } catch (error: any) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze video' },
      { status: 500 }
    );
  }
}
