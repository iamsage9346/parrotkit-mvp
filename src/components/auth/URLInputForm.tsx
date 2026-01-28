'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/common';

export const URLInputForm: React.FC = () => {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // 로그인 체크
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/signin');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      alert('URL을 입력해주세요.');
      return;
    }

    setLoading(true);
    
    try {
      // TODO: API 호출 (URL 분석 및 처리)
      console.log('Submitted URL:', url);
      alert('URL이 제출되었습니다!');
      // 다음 단계로 이동
      // router.push('/video-options');
    } catch (error) {
      console.error('URL submit error:', error);
      alert('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button 
          onClick={() => router.push('/dashboard')}
          className="text-2xl"
        >
          ☰
        </button>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 rounded-lg" />
          <h1 className="text-xl font-bold">Parrot Kit</h1>
        </div>
        <div className="w-8" />
      </div>

      {/* Main Content */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2">What's New in Shorts</h2>
        
        {/* Video Grid Placeholder */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[9/16] bg-gray-200 rounded-lg relative">
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-xs">
                <span>00:{15 + i}</span>
                <span>❤️ {(i * 1.2).toFixed(1)}K</span>
              </div>
            </div>
          ))}
        </div>

        {/* URL Input */}
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a URL link"
              className="w-full px-4 py-4 pr-12 border-2 border-gray-300 rounded-xl text-base focus:outline-none focus:border-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-500 disabled:opacity-50"
            >
              {loading ? '⏳' : '→'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
