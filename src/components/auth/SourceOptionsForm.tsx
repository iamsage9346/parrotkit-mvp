'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, Card } from '@/components/common';
import {
  VideoOptionsData,
  NICHES,
  GOALS,
  PLATFORMS,
  LENGTHS,
  VideoNiche,
  VideoGoal,
  VideoPlatform,
  VideoLength,
} from '@/types/auth';

export const SourceOptionsForm: React.FC = () => {
  const router = useRouter();
  const [sourceUrl, setSourceUrl] = useState('');
  const [formData, setFormData] = useState<Partial<VideoOptionsData>>({
    niche: 'Entertainment',
    goal: 'Viral',
    platform: 'TikTok',
    videoLength: '<15s',
    scriptOrIdea: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // 로컬 스토리지에서 URL 가져오기
    const url = localStorage.getItem('sourceUrl');
    if (url) {
      setSourceUrl(url);
      setFormData(prev => ({ ...prev, sourceUrl: url }));
    } else {
      router.push('/submit-video');
    }
  }, [router]);

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.niche || !formData.goal || !formData.platform) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      // TODO: API 호출 추가
      console.log('Video options:', formData);
      // const response = await fetch('/api/video/options', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });
      // const data = await response.json();
      // if (data.success) {
      //   localStorage.removeItem('sourceUrl');
      router.push('/dashboard');
      // }

      // 성공 메시지 표시
      // alert('Video submitted successfully! 🎉');
      // localStorage.removeItem('sourceUrl');
    } catch (err) {
      setError('Failed to submit video options. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Source URL</h1>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-600 break-all">{sourceUrl}</p>
        </div>

        <div className="flex gap-3 mb-6">
          <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            ~15s
          </span>
          <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
            High Viral Potential
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What's Your niche? *
          </label>
          <select
            value={formData.niche || ''}
            onChange={(e) => handleSelectChange('niche', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Select your niche...</option>
            {NICHES.map(niche => (
              <option key={niche} value={niche}>
                {niche}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What's Your goal? *
          </label>
          <select
            value={formData.goal || ''}
            onChange={(e) => handleSelectChange('goal', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Select your goal...</option>
            {GOALS.map(goal => (
              <option key={goal} value={goal}>
                {goal}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What's Your platform? *
          </label>
          <select
            value={formData.platform || ''}
            onChange={(e) => handleSelectChange('platform', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Select your platform...</option>
            {PLATFORMS.map(platform => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video Length (optional)
          </label>
          <select
            value={formData.videoLength || ''}
            onChange={(e) => handleSelectChange('videoLength', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Select video length...</option>
            {LENGTHS.map(length => (
              <option key={length} value={length}>
                {length}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Initial script or idea (optional)
          </label>
          <Input
            type="text"
            placeholder="Share your initial script, idea, or notes..."
            name="scriptOrIdea"
            value={formData.scriptOrIdea || ''}
            onChange={handleTextChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe what you want to create (optional)
          </label>
          <textarea
            name="description"
            placeholder="Any specific instructions? E.g., Make it funny!"
            value={formData.description || ''}
            onChange={handleTextChange}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 disabled:bg-gray-100"
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </form>

      <div className="text-center mt-8">
        <Link href="/submit-video" className="text-gray-600 text-sm hover:text-gray-900">
          ← Change Video
        </Link>
      </div>
    </Card>
  );
};
