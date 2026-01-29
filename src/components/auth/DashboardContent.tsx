'use client';

import React, { useState } from 'react';
import { Card, LoadingScreen, RecipeResult } from '@/components/common';

interface RecipeScene {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  thumbnail: string;
  description: string;
  script?: string[];
  progress: number;
}

export const Home: React.FC = () => {
  const [url, setUrl] = useState('');
  const [niche, setNiche] = useState('');
  const [goal, setGoal] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [recipeData, setRecipeData] = useState<{
    scenes: RecipeScene[];
    videoUrl: string;
    recipeId?: number;
    capturedVideos?: {[key: number]: boolean};
    matchResults?: {[key: number]: boolean};
  } | null>(null);

  // 컴포넌트 마운트 시 sessionStorage 확인
  React.useEffect(() => {
    const viewRecipe = sessionStorage.getItem('viewRecipe');
    if (viewRecipe) {
      try {
        const data = JSON.parse(viewRecipe);
        setRecipeData(data);
        sessionStorage.removeItem('viewRecipe');
      } catch (e) {
        console.error('Failed to load recipe:', e);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      alert('URL을 입력해주세요.');
      return;
    }

    setLoading(true);
    setAnalyzing(true);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, niche, goal, description }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '비디오 분석에 실패했습니다.');
      }

      // 성공 - Recipe 결과 표시
      setRecipeData({
        scenes: data.scenes,
        videoUrl: url,
      });
      setAnalyzing(false);
    } catch (error: any) {
      console.error('URL submit error:', error);
      alert(error.message || '오류가 발생했습니다. 다시 시도해주세요.');
      setAnalyzing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setRecipeData(null);
    setUrl('');
  };

  // 분석 중일 때 로딩 화면 표시
  if (analyzing) {
    return <LoadingScreen />;
  }

  // Recipe 결과가 있으면 결과 화면 표시
  if (recipeData) {
    return (
      <RecipeResult
        scenes={recipeData.scenes}
        videoUrl={recipeData.videoUrl}
        onBack={handleBack}
        recipeId={recipeData.recipeId}
        initialCapturedVideos={recipeData.capturedVideos || {}}
        initialMatchResults={recipeData.matchResults || {}}
      />
    );
  }

  const trendingVideos = [
    { duration: '00:20', likes: '4.2K', gradient: 'from-purple-400 via-pink-400 to-purple-500' },
    { duration: '00:25', likes: '5.4K', gradient: 'from-pink-400 via-purple-400 to-pink-500' },
    { duration: '00:30', likes: '6.6K', gradient: 'from-purple-500 via-pink-500 to-red-400' },
    { duration: '00:35', likes: '7.8K', gradient: 'from-pink-500 via-red-400 to-orange-400' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">What's New in Shorts</h1>
        <p className="text-gray-600">Discover trending shorts and analyze viral content</p>
      </div>
      
      {/* Video Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {trendingVideos.map((video, i) => (
          <div 
            key={i} 
            className={`aspect-[9/16] bg-gradient-to-br ${video.gradient} rounded-2xl relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group`}
          >
            {/* Overlay gradient for better text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1" />
              </div>
            </div>

            {/* Video info */}
            <div className="absolute bottom-3 left-3 right-3">
              <div className="flex items-center justify-between text-white text-sm font-medium">
                <span className="bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  {video.duration}
                </span>
                <span className="bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1">
                  ❤️ {video.likes}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* URL Input Card */}
      <Card>
        <div className="flex items-start gap-3 mb-4">
          <div className="text-2xl">🔗</div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Reference Link</h3>
            <p className="text-sm text-gray-800">Paste a viral video URL from TikTok, Instagram, YouTube Shorts</p>
          </div>
        </div>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.tiktok.com/@username/video/..."
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          disabled={loading}
        />
      </Card>

      {/* Prompt Input Card */}
      <Card className="mt-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="text-2xl">✍️</div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">Create Your Script</h3>
            <p className="text-sm text-gray-800">Tell us about your content and we'll generate a custom script</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">What's your niche?</label>
              <input
                type="text"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g. 뷰티, 요리, 운동, IT 리뷰..."
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">What's your goal?</label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. 팔로워 늘리기, 제품 홍보, 정보 전달..."
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Describe what you want to create!</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 최근 유행하는 다이어트 방법을 소개하는 숏폼 영상을 만들고 싶어요. 재미있고 친근한 톤으로 시청자가 바로 따라할 수 있게..."
              rows={3}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="w-full px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? '⏳ Analyzing...' : 'Analyze & Generate Script'}
          </button>
        </form>
      </Card>
    </div>
  );
};

export const MyRecipes: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Recipes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Recipe #{i}</h3>
            <p className="text-sm text-gray-600">Created recently</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const Projects: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Projects</h1>
      <Card>
        <p className="text-gray-600 text-center py-12">No projects yet. Create your first project!</p>
      </Card>
    </div>
  );
};

export const Templates: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Templates</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <h3 className="font-semibold text-gray-900 mb-2">Template #{i}</h3>
            <p className="text-sm text-gray-600 mb-4">Professional template for your shorts</p>
            <button className="text-blue-500 font-semibold hover:underline">Use Template →</button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const AIAssistant: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">AI Assistant</h1>
      <Card>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              Welcome to AI Assistant! I can help you generate scripts, ideas, and more for your viral content.
            </p>
          </div>
          <textarea
            placeholder="Ask me anything about your content..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
          <button className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600">
            Send Message
          </button>
        </div>
      </Card>
    </div>
  );
};

export const Settings: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
      <div className="space-y-6">
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Account Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                defaultValue="user@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                defaultValue="username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600">
              Save Changes
            </button>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Preferences</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-gray-700">Email notifications</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-gray-700">Marketing emails</span>
            </label>
          </div>
        </Card>
      </div>
    </div>
  );
};
