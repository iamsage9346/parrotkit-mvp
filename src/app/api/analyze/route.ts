import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // 처리 시간 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 2000));

    // YouTube URL에서 비디오 ID 추출
    const videoId = extractVideoId(url);
    
    // YouTube Shorts는 보통 15~60초
    // 일단 기본값으로 처리 (나중에 실제 API 연동 시 교체)
    const totalDuration = 40; // 기본 40초로 설정
    
    // 4초씩 자르기
    const sceneDuration = 4;
    const sceneCount = Math.ceil(totalDuration / sceneDuration);
    
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
      const endTime = Math.min((i + 1) * sceneDuration, totalDuration);
      
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
        title: 'YouTube Video',
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
  
  return 'awPG4F9yyOc'; // fallback
}
