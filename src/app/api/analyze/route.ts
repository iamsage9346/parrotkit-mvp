import { NextRequest, NextResponse } from 'next/server';

// 간단한 버전 - YouTube 다운로드는 클라이언트에서 URL만 받음
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // 처리 시간 시뮬레이션 (실제로는 FFmpeg 분석 시간)
    await new Promise(resolve => setTimeout(resolve, 3000));

    // YouTube URL에서 비디오 ID 추출
    const videoId = extractVideoId(url);
    
    // Mock scene detection - 40초 영상을 4초씩 10개로 자르기
    const sceneDuration = 4; // 4초씩
    const totalDuration = 40; // 전체 40초
    const sceneCount = Math.floor(totalDuration / sceneDuration);
    
    // 영상 흐름에 맞는 씬 이름
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
      const endTime = (i + 1) * sceneDuration;
      
      scenes.push({
        id: i + 1,
        title: sceneNames[i] || `Scene ${i + 1}`,
        startTime: formatTime(startTime),
        endTime: formatTime(endTime),
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        description: sceneDescriptions[i] || `Scene ${i + 1}`,
        progress: 0, // 모두 0으로 (촬영 대기 상태)
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
        title: 'YouTube Shorts Video',
        duration: '00:08',
        platform: 'YouTube Shorts',
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

function extractVideoId(url: string): string {
  // YouTube Shorts URL에서 비디오 ID 추출
  const patterns = [
    /shorts\/([a-zA-Z0-9_-]+)/,
    /watch\?v=([a-zA-Z0-9_-]+)/,
    /youtu\.be\/([a-zA-Z0-9_-]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return 'awPG4F9yyOc'; // fallback
}
