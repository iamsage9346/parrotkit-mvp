import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

type Platform = 'youtube' | 'youtube-shorts' | 'instagram' | 'tiktok' | 'other';

function detectPlatform(url: string): Platform {
  if (url.includes('youtube.com/shorts') || url.includes('youtu.be')) return 'youtube-shorts';
  if (url.includes('youtube.com')) return 'youtube';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('tiktok.com')) return 'tiktok';
  return 'other';
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /shorts\/([a-zA-Z0-9_-]+)/,
    /watch\?v=([a-zA-Z0-9_-]+)/,
    /youtu\.be\/([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function extractInstagramId(url: string): string | null {
  const match = url.match(/\/(reel|p)\/([a-zA-Z0-9_-]+)/);
  return match ? match[2] : null;
}

function extractTikTokId(url: string): string | null {
  const match = url.match(/\/video\/(\d+)/);
  return match ? match[1] : null;
}

/** Fetch the page HTML and extract og:image meta tag */
async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });

    if (!res.ok) return null;

    const html = await res.text();

    const ogMatch = html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i)
      || html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:image["']/i);

    if (ogMatch) return ogMatch[1];

    const twitterMatch = html.match(/<meta\s+(?:property|name)=["']twitter:image["']\s+content=["']([^"']+)["']/i)
      || html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']twitter:image["']/i);

    if (twitterMatch) return twitterMatch[1];

    return null;
  } catch (e) {
    console.error('Failed to fetch og:image:', e);
    return null;
  }
}

function generatePlaceholderThumbnail(sceneIndex: number, sceneTitle: string): string {
  const colors = [
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140'],
    ['#a18cd1', '#fbc2eb'],
  ];
  const [c1, c2] = colors[sceneIndex % colors.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${c1}"/>
      <stop offset="100%" style="stop-color:${c2}"/>
    </linearGradient></defs>
    <rect width="320" height="180" fill="url(#g)"/>
    <text x="160" y="80" text-anchor="middle" fill="white" font-size="20" font-family="Arial" font-weight="bold">#${sceneIndex + 1}</text>
    <text x="160" y="110" text-anchor="middle" fill="white" font-size="14" font-family="Arial" opacity="0.9">${sceneTitle}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const defaultSceneDescriptions = [
  '이거 아직도 모르는 사람 많던데… 진짜 다들 알아야 됨',
  '안녕하세요, 오늘은 여러분이 꼭 알아야 할 꿀팁 하나 알려드릴게요',
  '처음에 저도 반신반의했는데, 직접 해보니까 진짜 효과 있더라고요',
  '자, 여기가 핵심이에요. 이 부분만 따라하시면 됩니다',
  '이렇게 하면 끝! 생각보다 간단하죠?',
  '도움이 됐다면 좋아요, 팔로우 부탁드려요. 다음에 더 좋은 꿀팁으로 올게요!'
];

const defaultSceneScripts: {[key: number]: string[]} = {
  1: [
    '이거 아직도 모르는 사람 많던데… 진짜 다들 알아야 됨',
    '(카메라를 향해 자신감 있게 말하기)',
    '표정은 약간 놀란 듯 + 호기심 유발',
  ],
  2: [
    '안녕하세요, 오늘은 여러분이 꼭 알아야 할 꿀팁 하나 알려드릴게요',
    '(자연스럽게 인사하면서 시작)',
    '편안한 톤으로 친근하게 말하기',
  ],
  3: [
    '처음에 저도 반신반의했는데, 직접 해보니까 진짜 효과 있더라고요',
    '(경험을 공유하듯 솔직하게)',
    '공감가는 표정 + 고개 끄덕이기',
  ],
  4: [
    '자, 여기가 핵심이에요. 이 부분만 따라하시면 됩니다',
    '(핵심 포인트를 강조하며 또박또박)',
    '손가락으로 포인트 짚기 or 화면 가리키기',
  ],
  5: [
    '이렇게 하면 끝! 생각보다 간단하죠?',
    '(마무리하는 느낌으로 밝게)',
    '만족스러운 표정으로 정리',
  ],
  6: [
    '도움이 됐다면 좋아요, 팔로우 부탁드려요!',
    '다음에 더 좋은 꿀팁으로 올게요~',
    '(손 흔들며 마무리 인사)',
  ],
};

async function generateScriptsWithAI(niche: string, goal: string, description: string): Promise<{descriptions: string[], scripts: {[key: number]: string[]}} | null> {
  try {
    const prompt = `당신은 숏폼 영상 대본 작가입니다. 사용자의 정보를 바탕으로 6개 씬의 대본을 작성해주세요.

사용자 정보:
- 니치/분야: ${niche}
- 목표: ${goal}
- 설명: ${description}

6개 씬 구조: Hook, Introduction, Build Up, Peak, Resolution, Outro

다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "descriptions": ["씬1 한줄 요약", "씬2 한줄 요약", "씬3 한줄 요약", "씬4 한줄 요약", "씬5 한줄 요약", "씬6 한줄 요약"],
  "scripts": {
    "1": ["대사1", "연기 지시", "표정/동작"],
    "2": ["대사1", "연기 지시", "표정/동작"],
    "3": ["대사1", "연기 지시", "표정/동작"],
    "4": ["대사1", "연기 지시", "표정/동작"],
    "5": ["대사1", "연기 지시", "표정/동작"],
    "6": ["대사1", "연기 지시", "표정/동작"]
  }
}

각 씬의 대본은 3줄로 구성:
1. 실제 말할 대사 (한국어, 자연스러운 구어체)
2. 연기 지시 (괄호로 감싸서)
3. 표정이나 동작 가이드`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      descriptions: parsed.descriptions,
      scripts: Object.fromEntries(
        Object.entries(parsed.scripts).map(([k, v]) => [parseInt(k), v])
      ) as {[key: number]: string[]},
    };
  } catch (e) {
    console.error('AI script generation failed:', e);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, niche, goal, description } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const platform = detectPlatform(url);
    const videoId = extractVideoId(url);
    const ogImage = await fetchOgImage(url);

    // Generate AI scripts if prompts are provided
    const hasPrompts = niche?.trim() || goal?.trim() || description?.trim();
    const aiResult = hasPrompts
      ? await generateScriptsWithAI(niche || '', goal || '', description || '')
      : null;

    const totalDuration = 30;
    const sceneDuration = 5;
    const sceneCount = Math.ceil(totalDuration / sceneDuration);

    const sceneNames = ['Hook', 'Introduction', 'Build Up', 'Peak', 'Resolution', 'Outro'];

    const sceneDescriptions = aiResult?.descriptions || defaultSceneDescriptions;

    const scenes = [];

    for (let i = 0; i < sceneCount; i++) {
      const startTime = i * sceneDuration;
      const endTime = Math.min((i + 1) * sceneDuration, totalDuration);
      const title = sceneNames[i] || `Scene ${i + 1}`;

      let thumbnail: string;

      if (platform === 'youtube' || platform === 'youtube-shorts') {
        const thumbIndexes = [0, 1, 2, 3, 1, 2];
        const thumbIdx = thumbIndexes[i % thumbIndexes.length];
        thumbnail = `https://img.youtube.com/vi/${videoId || 'dQw4w9WgXcQ'}/${thumbIdx}.jpg`;
      } else if (ogImage) {
        thumbnail = ogImage;
      } else {
        thumbnail = generatePlaceholderThumbnail(i, title);
      }

      scenes.push({
        id: i + 1,
        title,
        startTime: formatTime(startTime),
        endTime: formatTime(endTime),
        thumbnail,
        description: sceneDescriptions[i] || `Scene ${i + 1}`,
        script: aiResult?.scripts?.[i + 1] || defaultSceneScripts[i + 1] || [],
        progress: 0,
      });
    }

    const platformLabels: Record<Platform, string> = {
      'youtube': 'YouTube',
      'youtube-shorts': 'YouTube Shorts',
      'instagram': 'Instagram Reels',
      'tiktok': 'TikTok',
      'other': 'Video',
    };

    return NextResponse.json({
      success: true,
      videoId: videoId || extractInstagramId(url) || extractTikTokId(url) || 'unknown',
      url,
      scenes,
      metadata: {
        title: `${platformLabels[platform]} Video`,
        duration: formatTime(totalDuration),
        platform: platformLabels[platform],
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
