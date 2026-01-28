export interface SignUpFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface SignInFormData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    email: string;
    username: string;
  };
}

export type InterestCategory = 
  | 'Meme/Trend'
  | 'Fashion'
  | 'Beauty'
  | 'Apps'
  | 'Education'
  | 'Lifestyle'
  | 'Finance'
  | 'Rap'
  | 'Food'
  | 'Music'
  | 'News'
  | 'Travel'
  | 'Review';

export interface InterestsData {
  selectedInterests: InterestCategory[];
}

export const INTEREST_CATEGORIES: InterestCategory[] = [
  'Meme/Trend',
  'Fashion',
  'Beauty',
  'Apps',
  'Education',
  'Lifestyle',
  'Finance',
  'Rap',
  'Food',
  'Music',
  'News',
  'Travel',
  'Review',
];

export type VideoNiche = 
  | 'Beauty'
  | 'Fashion'
  | 'Comedy'
  | 'Education'
  | 'Entertainment'
  | 'Gaming'
  | 'Lifestyle'
  | 'Music'
  | 'Sports'
  | 'Food'
  | 'Travel'
  | 'Business';

export type VideoGoal = 
  | 'Get Views'
  | 'Get Followers'
  | 'Get Engagement'
  | 'Viral'
  | 'Brand Awareness'
  | 'Sales';

export type VideoLength = 
  | '<15s'
  | '15-30s'
  | '30-60s'
  | '>60s';

export type VideoPlatform = 
  | 'TikTok'
  | 'Instagram Reels'
  | 'YouTube Shorts'
  | 'Snapchat'
  | 'Facebook';

export interface SourceData {
  url: string;
}

export interface VideoOptionsData {
  sourceUrl: string;
  niche: VideoNiche;
  goal: VideoGoal;
  platform: VideoPlatform;
  videoLength?: VideoLength;
  scriptOrIdea?: string;
  description?: string;
}

export const NICHES: VideoNiche[] = [
  'Beauty',
  'Fashion',
  'Comedy',
  'Education',
  'Entertainment',
  'Gaming',
  'Lifestyle',
  'Music',
  'Sports',
  'Food',
  'Travel',
  'Business',
];

export const GOALS: VideoGoal[] = [
  'Get Views',
  'Get Followers',
  'Get Engagement',
  'Viral',
  'Brand Awareness',
  'Sales',
];

export const LENGTHS: VideoLength[] = [
  '<15s',
  '15-30s',
  '30-60s',
  '>60s',
];

export const PLATFORMS: VideoPlatform[] = [
  'TikTok',
  'Instagram Reels',
  'YouTube Shorts',
  'Snapchat',
  'Facebook',
];

export type DashboardTab = 'home' | 'recipes' | 'projects' | 'templates' | 'ai-assistant' | 'settings';

export interface PricingPlan {
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  popular?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: 'Free Plan',
    price: 0,
    period: '/month',
    description: 'Turn any Shorts/TikTok link into a shoot-ready recipe in minutes.',
    features: [
      '✅ Reference Link Analyzer (limited)',
      '📷 Basic Shot Recipe Template (Hook → Cuts → Captions)',
      '💾 Save up to 10 recipes',
      '📄 Export (basic)',
      '⭕ Community Access',
    ],
    buttonText: 'Start for Free',
  },
  {
    name: 'Pro Plan',
    price: 24,
    period: '/month',
    description: 'Create viral-ready content faster with advanced breakdowns + reusable templates.',
    features: [
      '✅ Unlimited Recipe Generation (fair use)',
      '📷 Shot-by-Shot Breakdown (cuts, captions, B-roll cues)',
      '❌ Hook Variations + Script/VO Prompts',
      '🚀 Format Library (trending structures & templates)',
      '💾 Recipe Vault (search, tags, version history)',
      '📄 Export to Notion/Docs + Downloadable templates',
      '🚀 Priority Speed + Early Features',
    ],
    buttonText: 'Get Access Now',
    popular: true,
  },
];
