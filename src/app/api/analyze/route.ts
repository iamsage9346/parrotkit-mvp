import { NextRequest, NextResponse } from 'next/server';

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

    // Try og:image first
    const ogMatch = html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i)
      || html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:image["']/i);

    if (ogMatch) return ogMatch[1];

    // Try twitter:image as fallback
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

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const platform = detectPlatform(url);
    const videoId = extractVideoId(url);

    // Fetch og:image from the URL (works for Instagram, TikTok, YouTube, etc.)
    const ogImage = await fetchOgImage(url);

    const totalDuration = 30;
    const sceneDuration = 5;
    const sceneCount = Math.ceil(totalDuration / sceneDuration);

    const sceneNames = [
      'Hook',
      'Introduction',
      'Build Up',
      'Peak',
      'Resolution',
      'Outro'
    ];

    const sceneDescriptions = [
      'Grab attention with a strong opening hook',
      'Set the scene and introduce the topic',
      'Build tension and develop the story',
      'Deliver the peak moment or key reveal',
      'Wrap up the main content',
      'End with a call-to-action or final message'
    ];

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
        // Use the og:image from the original page (first frame / cover image)
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
