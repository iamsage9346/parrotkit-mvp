'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, Card } from '@/components/common';
import { SourceData } from '@/types/auth';

export const URLInputForm: React.FC = () => {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!url.trim()) {
      setError('Please enter a URL');
      setLoading(false);
      return;
    }

    if (!isValidUrl(url)) {
      setError('Please enter a valid URL');
      setLoading(false);
      return;
    }

    try {
      // TODO: API 호출 - 영상 메타데이터 가져오기
      console.log('Video URL:', url);
      // const response = await fetch('/api/video/validate', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ url }),
      // });
      // const data = await response.json();
      // if (data.success) {
      //   localStorage.setItem('sourceUrl', url);
      //   router.push('/video-options');
      // }

      // 임시: 로컬 스토리지에 저장하고 이동
      localStorage.setItem('sourceUrl', url);
      router.push('/video-options');
    } catch (err) {
      setError('Failed to process URL. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">What's New in Short</h1>
        <p className="text-gray-600 text-sm">
          Paste your source video URL to get started with viral content suggestions
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paste a URL link
          </label>
          <Input
            type="url"
            placeholder="https://www.instagram.com/..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError('');
            }}
            required
          />
          <p className="text-xs text-gray-500 mt-2">
            Supports Instagram, TikTok, YouTube, and other video platforms
          </p>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Continue →'}
        </Button>
      </form>

      <div className="text-center mt-8">
        <Link href="/interests" className="text-gray-600 text-sm hover:text-gray-900">
          ← Back to Interests
        </Link>
      </div>
    </Card>
  );
};
