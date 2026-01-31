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
  'Most people still don\'t know this... you NEED to hear this',
  'Hey everyone, today I\'m sharing a tip you absolutely need to know',
  'I was skeptical at first, but after trying it myself, it actually works',
  'Okay, here\'s the key part. Just follow this and you\'re set',
  'And that\'s it! Easier than you thought, right?',
  'If this helped, hit like and follow! More great tips coming soon!'
];

const defaultSceneScripts: {[key: number]: string[]} = {
  1: [
    'Most people still don\'t know this... you NEED to hear this',
    '(Look at the camera with confidence)',
    'Slightly surprised expression + spark curiosity',
  ],
  2: [
    'Hey everyone, today I\'m sharing a tip you absolutely need to know',
    '(Start with a natural greeting)',
    'Relaxed, friendly tone',
  ],
  3: [
    'I was skeptical at first, but after trying it myself, it actually works',
    '(Share your experience honestly)',
    'Relatable expression + nodding',
  ],
  4: [
    'Okay, here\'s the key part. Just follow this and you\'re set',
    '(Emphasize the main point clearly)',
    'Point with finger or gesture at screen',
  ],
  5: [
    'And that\'s it! Easier than you thought, right?',
    '(Wrap up with an upbeat tone)',
    'Satisfied expression, nod and smile',
  ],
  6: [
    'If this helped, hit like and follow!',
    'More great tips coming soon!',
    '(Wave and give a closing smile)',
  ],
};

async function generateScriptsWithAI(niche: string, goal: string, description: string): Promise<{descriptions: string[], scripts: {[key: number]: string[]}} | null> {
  try {
    const prompt = `You are a short-form video script writer. Based on the user's info, write scripts for 6 scenes.

User Info:
- Niche: ${niche}
- Goal: ${goal}
- Description: ${description}

6 scene structure: Hook, Introduction, Build Up, Peak, Resolution, Outro

Respond ONLY in the following JSON format (no other text):
{
  "descriptions": ["scene1 one-line summary", "scene2 one-line summary", "scene3 one-line summary", "scene4 one-line summary", "scene5 one-line summary", "scene6 one-line summary"],
  "scripts": {
    "1": ["dialogue line", "acting direction", "expression/gesture"],
    "2": ["dialogue line", "acting direction", "expression/gesture"],
    "3": ["dialogue line", "acting direction", "expression/gesture"],
    "4": ["dialogue line", "acting direction", "expression/gesture"],
    "5": ["dialogue line", "acting direction", "expression/gesture"],
    "6": ["dialogue line", "acting direction", "expression/gesture"]
  }
}

Each scene script has 3 lines:
1. The actual dialogue to say (natural, conversational English)
2. Acting direction (in parentheses)
3. Expression or gesture guide`;

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
        const vid = videoId || 'dQw4w9WgXcQ';
        // Use highest quality thumbnails available
        const thumbNames = ['maxresdefault', 'sddefault', 'hqdefault', 'mqdefault', 'hqdefault', 'sddefault'];
        const thumbName = thumbNames[i % thumbNames.length];
        thumbnail = `https://img.youtube.com/vi/${vid}/${thumbName}.jpg`;
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
